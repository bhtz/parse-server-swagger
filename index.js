const express = require('express');
const swaggerUi = require('swagger-ui-express');
const Parse = require("parse/node");

const parseSchemaToOpenAPI = require('./schema-to-openapi');

/**
 * @typedef {object} Options Options
 * @prop {string} [swaggerUIEndpoint="/api-docs"] The endpoint in which swagger-ui will be served
 * @prop {string} [openAPIEndpoint="/openapi.json"] The endpoint that will serve the openapi
 * @prop {string} [parseEndpoint="/parse"]
 * @prop {object} [swaggerUIExpressOptions] See [https://github.com/scottie1984/swagger-ui-express/blob/4.1.2/index.js#L141]()
 *  and [https://github.com/swagger-api/swagger-ui/blob/master/docs/usage/configuration.md]() for `swaggerOptions`
 * @prop {object} [info] The info object
 * @prop {boolean} [allowMasterKeyEndpoints] - Generate documentation for every possible endpoint,
 *  regardless of CLPs
 * @prop {boolean} [allowParseClasses] - Generate documentation for special Parse classes (starting with "_")
 *
 * 
 * @example
 * const parseSwagger = new ParseExpressSwagger({
 *  openAPIEndpoint: "/api-reference.json"
 * })
 * app.use(parseSwagger.app)
 * 
 * @param {Options} [options]
 * @returns {import("express").Express} Express middleware
 */
function ParseOpenAPI(options) {
    /**
     * Default values of every option
     */
    const {
        swaggerUIEndpoint = "/api-docs",
        openAPIEndpoint = "/openapi.json",
        parseEndpoint = "/parse",
        swaggerUIExpressOptions = {
            swaggerOptions: {
                url: "/openapi.json"
            }
        },
        info = {
            title: "Parse API",
            description: "Interact with Parse API",
            version: "1.0.0"
        },
        allowMasterKeyEndpoints = false,
        allowParseClasses = false
    } = options;

    this.schemaConfig = {
        parseEndpoint,
        info,
        allowMasterKeyEndpoints,
        allowParseClasses
    }

    const app = express();

    app.use(
        swaggerUIEndpoint,
        swaggerUi.serve,
        swaggerUi.setup(null, swaggerUIExpressOptions)
    );

    app.use(openAPIEndpoint, this.renderOpenAPISpec.bind(this));

    return app;
};

/**
 * Get parse compatible api swagger.json base
 */
ParseOpenAPI.prototype.renderOpenAPISpec = async function (req, res) {
    if (!this.schema) {
        this.schema = await Parse.Schema.all({
            useMasterKey: true
        });
    }
    const openAPIObject = parseSchemaToOpenAPI(
        this.schema,
        this.schemaConfig
    );
    res.json(openAPIObject);
}

module.exports = ParseOpenAPI;