/**
 * Schema of this file: [https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/schemas/v3.0/schema.json]()
 */
const parseBaseOpenAPISpec = require("./parse-base.openapi.json");

const readOnlyFields = ["objectId", "createdAt", "updatedAt", "ACL"];

/**
 * @typedef {object} ParseSchema
 * @prop {string} className
 * @prop {object} classLevelPermissions
 * @prop {{[fieldName: string]: object}} fields
 */

/**
 * @typedef {object} Options
 * @prop {string} [parseEndpoint] - Opportunity to pass a full URL
 * @prop {object} [info] - Override the default info about the API
 * @prop {boolean} [allowMasterKeyEndpoints] - Generate documentation for every possible endpoint,
 *  regardless of CLPs
 * @prop {boolean} [allowParseClasses] - Generate documentation for special Parse classes (starting with "_")
 *
 * Transform Parse Server schema to openapi.json
 * @param {ParseSchema[]} schemas
 * @param {Options} [options] - Opportunity to pass a full URL
 */
module.exports = function(schemas, options = {}) {
  const spec = Object.assign({}, parseBaseOpenAPISpec);

  if (options.parseEndpoint) {
    spec.servers[0].url = options.parseEndpoint;
  }
  if (options.info) {
    spec.info = options.info;
  }

  for (const classSchema of schemas) {
    /**
     * Skip Parse internals
     */
    if (classSchema.className[0] !== "_" || options.allowParseClasses) {
      const actions = getParseClassActions(classSchema);
      let schemaNeeded = false;
      for (const action of actions) {
        const permissions =
          classSchema.classLevelPermissions[action.actionName];
        /**
         * If any of the values is `true`, it might be available to a non-masterkey client
         */
        const endpointActive = Object.values(permissions).some(bool => bool);
        if (endpointActive || options.allowMasterKeyEndpoints) {
          spec.paths[action.path] = Object.assign({}, spec.paths[action.path], {
            [action.method]: action.schema
          });
          schemaNeeded = true;
        }
      }
      if (schemaNeeded) {
        spec.components.schemas[classSchema.className] = transformClassToSchema(
          classSchema
        );
      }
    }
  }
  return spec;
};

/**
 *
 * @param {object} classSchema server classes
 */
function transformClassToSchema(classSchema) {
  const fieldSchema = {
    type: "object",
    required: ["objectId", "createdAt", "updatedAt", "ACL"],
    properties: {
      objectId: {
        type: "string",
        readOnly: true
      },
      createdAt: {
        type: "string",
        format: "date-time",
        readOnly: true
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        readOnly: true
      },
      ACL: {
        type: "object",
        readOnly: true
      }
    }
  };

  for (const fieldName in classSchema.fields) {
    const element = classSchema.fields[fieldName];
    if (!readOnlyFields.includes(fieldName)) {
      fieldSchema.properties[fieldName] = schemaTypeToOpenAPIType(element);
    }
  }
  return fieldSchema;
}

/**
 * Cast parse type to swagger type
 * @param {object} fieldDefinition
 */
function schemaTypeToOpenAPIType(fieldDefinition) {
  switch (fieldDefinition.type) {
    case "String":
      return { type: "string" };

    case "Number":
      return { type: "number" };

    case "Boolean":
      return { type: "boolean" };

    case "Array":
      return { type: "array", items: {} };

    case "Object":
      return { type: "object" };

    case "File":
      return { type: "object" };

    case "Pointer":
      return {
        type: "object",
        required: ["__type", "className", "objectId"],
        properties: {
          __type: {
            type: "string",
            enum: ["Pointer"]
          },
          objectId: {
            type: "string"
          },
          className: {
            type: "string",
            enum: [fieldDefinition.targetClass]
          }
        }
      };
    case "Relation":
      return { type: "object" };

    case "Date":
      return { $ref: "#/components/schemas/Date" };

    default:
      return { type: "string" };
  }
}

/**
 * Get OpenAPI configuration for parse endpoint
 *
 * @param {ParseSchema} classSchema
 */
function getParseClassActions(classSchema) {
  const pathPrefix = "/classes/" + classSchema.className;
  const pathID = pathPrefix + "/{id}";
  return [
    {
      actionName: "find",
      method: "get",
      path: pathPrefix,
      schema: {
        summary: `Get every ${classSchema.className}`,
        tags: [`${classSchema.className}`],
        parameters: [
          {
            in: "query",
            name: "where",
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  example: { fieldName: "fieldValue" }
                }
              }
            }
          }
        ],
        responses: {
          "200": {
            description: `Return ${classSchema.className} data`,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    results: {
                      type: "array",
                      items: {
                        $ref: `#/components/schemas/${classSchema.className}`
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    {
      actionName: "create",
      method: "post",
      path: pathPrefix,
      schema: {
        summary: `Create a new ${classSchema.className}`,
        tags: [`${classSchema.className}`],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: `#/components/schemas/${classSchema.className}`
              }
            }
          }
        },
        responses: {
          "200": {
            description: `Creation of a new ${classSchema.className} successful. Only the fields missing in the body will be present`,
            content: {
              "application/json": {
                schema: {
                  $ref: `#/components/schemas/${classSchema.className}`
                }
              }
            }
          }
        }
      }
    },
    {
      actionName: "get",
      path: pathID,
      method: "get",
      schema: {
        summary: `Get an entry of ${classSchema.className} by id`,
        tags: [`${classSchema.className}`],
        parameters: [
          {
            in: "path",
            name: "id",
            description: "The id of the element you want to get.",
            required: true,
            schema: {
              type: "string"
            }
          }
        ],
        responses: {
          "200": {
            description: "Returns data",
            content: {
              "application/json": {
                schema: {
                  $ref: `#/components/schemas/${classSchema.className}`
                }
              }
            }
          }
        }
      }
    },
    {
      actionName: "update",
      path: pathID,
      method: "put",
      schema: {
        summary: "Update instance",
        tags: [`${classSchema.className}`],
        requestBody: {
          required: true,
          description: "The element you want update with.",
          content: {
            "application/json": {
              schema: {
                $ref: `#/components/schemas/${classSchema.className}`
              }
            }
          }
        },
        parameters: [
          {
            in: "path",
            name: "id",
            description: "The id of the element you want to update.",
            required: true,
            schema: {
              type: "string"
            }
          }
        ],
        responses: {
          "200": {
            description: "Update successful",
            content: {
              "application/json": {
                schema: {
                  "type": "string",
                  "format": "date-time"
                }
              }
            }
          }
        }
      }
    },
    {
      actionName: "delete",
      path: pathID,
      method: "delete",
      schema: {
        summary: `Delete an entry of ${classSchema.className}`,
        tags: [`${classSchema.className}`],
        parameters: [
          {
            in: "path",
            name: "id",
            description: "The id of the element you want to delete.",
            required: true,
            schema: {
              type: "string"
            }
          }
        ],
        responses: {
          "200": {
            description: "Returns a confirmation message"
          }
        }
      }
    }
  ];
}
