/**
 * Transform Parse Server schema.json to swagger.json
 */
exports.parseSchemaToSwagger = function (spec, schemas) {
    for (const classes of schemas) {
        spec.components.schemas[classes.className] = transformClasseToSchema(classes);
        spec.paths['/parse/classes/' + classes.className] = getPath(classes);
        spec.paths['/parse/classes/' + classes.className + '/{id}'] = getPathById(classes);
    }

    return spec;
}

/**
 * 
 * @param {classe} parse server classes 
 */
function transformClasseToSchema(classe) {
    var schema = { type: "object", properties: {} };
    for (const key in classe.fields) {
        const element = classe.fields[key];
        if (key != 'ACL') {
            schema.properties[key] = schemaTypeToSwaggerType(element.type)
        }
    }

    return schema;
}

/**
 * Cast parse type to swagger type
 * @param {Parse type} type 
 */
function schemaTypeToSwaggerType(type) {
    var swaggerType;
    switch (type) {
        case 'String':
            swaggerType = { type: 'string' };
            break;

        case 'Number':
            swaggerType = { type: 'number' };
            break;

        case 'Boolean':
            swaggerType = { type: 'boolean' };
            break;

        case 'Array':
            swaggerType = { type: 'array', items: { type: 'object' } };
            break;

        case 'Object':
            swaggerType = { type: 'object' };
            break;

        case 'File':
            swaggerType = { type: 'object' };
            break;

        case 'Pointer':
            swaggerType = { type: 'object' };
            break;

        case 'Relation':
            swaggerType = { type: 'object' };
            break;

        default:
            swaggerType = { type: 'string' };
            break;
    }
    return swaggerType;
}

/**
 * Get swagger configuration (CREATE, READ) for parse endpoint
 * @param {*} classes 
 */
function getPath(classes) {
    return {
        "get": {
            "security": [
                { "ParseAppId": [], "ParseSessionId": [] }
            ],
            "summary": `Get ${classes.className} data`,
            "description": "Find queries documentation here https://docs.parseplatform.org/rest/guide/#queries",
            "tags": [`${classes.className}`],
            "responses": {
                "200": {
                    "description": `Return ${classes.className} data`,
                    "schema": {
                        "$ref": `#/components/schemas/${classes.className}`
                    }
                },
                "400": { "description": "Bad Request" },
                "401": { "description": "Unauthorized" },
                "406": { "description": "Not Acceptable" },
                "500": { "description": "Server Internal error" }
            }
        },
        "post": {
            "security": [
                { "ParseAppId": [], "ParseSessionId": [] }
            ],
            "summary": "Add object instance",
            "description": "Happy to access The System",
            "tags": [`${classes.className}`],
            "parameters": [
                {
                    "in": "body",
                    "name": "body",
                    "description": "object that needs to be added to the store",
                    "required": true,
                    "schema": {
                        "$ref": `#/components/schemas/${classes.className}`
                    }
                }
            ],
            "responses": {
                "200": {
                    "description": `Returns ${classes.className} data`,
                    "schema": {
                        "$ref": `#/components/schemas/${classes.className}`
                    }
                },
                "400": { "description": "Bad Request" },
                "401": { "description": "Unauthorized" },
                "406": { "description": "Not Acceptable" },
                "500": { "description": "Server Internal error" }
            }
        }
    }
}

/**
 * Get swagger configuration (UPDATE, READ, DELETE) for parse endpoint
 * @param {*} classes 
 */
function getPathById(classes) {

    return {
        "get": {
            "security": [
                {
                    "ParseAppId": [],
                    "ParseSessionId": []
                }
            ],
            "summary": `Get ${classes.className} by id`,
            "description": "Happy to access The System",
            "tags": [`${classes.className}`],
            "parameters": [
                {
                    "in": "path",
                    "name": "id",
                    "type": "string",
                    "description": "The id of the element you want to get.",
                    "required": true
                }
            ],
            "responses": {
                "200": {
                    "description": "Returns data",
                    "schema": {
                        "$ref": `#/components/schemas/${classes.className}`
                    }
                },
                "400": { "description": "Bad Request" },
                "401": { "description": "Unauthorized" },
                "406": { "description": "Not Acceptable" },
                "500": { "description": "Server Internal error" }
            }
        },
        "put": {
            "security": [
                {
                    "ParseAppId": [],
                    "ParseSessionId": []
                }
            ],
            "summary": "Update instance",
            "description": "Happy to access The System",
            "tags": [`${classes.className}`],
            "parameters": [
                {
                    "in": "path",
                    "name": "id",
                    "type": "string",
                    "description": "The id of the element you want to update.",
                    "required": true
                },
                {
                    "in": "body",
                    "name": "movie",
                    "description": "The element you want update with.",
                    "required": true,
                    "schema": {
                        "$ref": `#/components/schemas/${classes.className}`
                    }
                }
            ],
            "responses": {
                "200": {
                    "description": "Returns instance data",
                    "schema": {
                        "$ref": `#/components/schemas/${classes.className}`
                    }
                },
                "400": {
                    "description": "Bad Request"
                },
                "401": {
                    "description": "Unauthorized"
                },
                "406": {
                    "description": "Not Acceptable"
                },
                "500": {
                    "description": "Server Internal error"
                }
            }
        },
        "delete": {
            "security": [
                {
                    "ParseAppId": [],
                    "ParseSessionId": []
                }
            ],
            "summary": "Delete instance",
            "description": "Happy to access The System",
            "tags": [`${classes.className}`],
            "parameters": [
                {
                    "in": "path",
                    "name": "id",
                    "type": "string",
                    "description": "The id of the element you want to delete.",
                    "required": true
                }
            ],
            "responses": {
                "200": {
                    "description": "Returns a confirmation message"
                },
                "400": {
                    "description": "Bad Request"
                },
                "401": {
                    "description": "Unauthorized"
                },
                "404": {
                    "description": "Id not found",
                    "schema": {
                        "$ref": "#/components/schemas/notfound"
                    }
                },
                "406": {
                    "description": "Not Acceptable"
                },
                "500": {
                    "description": "Server Internal error"
                }
            }
        }
    }
}