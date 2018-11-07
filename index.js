var express = require('express');
var swaggerUi = require('swagger-ui-express');
var request = require('request-promise');
var parseSchemaToSwagger = require('./schema-to-swagger').parseSchemaToSwagger;
var parseBaseSwaggerSpec = require('./parse-swagger-base.json');

/**
 * constructor
 * @returns app: express middleware
 */
function ParseSwagger(options) {
    this.config = options;

    var app = express();

    var swagOpts = { swaggerUrl: this.config.host + '/api-docs' };
    app.use('/swagger', swaggerUi.serve, swaggerUi.setup(null, swagOpts));
    app.use('/api-docs', this.renderSwaggerSpec.bind(this));

    return app;
};

/**
 * Get parse compatible api swagger.json base
 */
ParseSwagger.prototype.renderSwaggerSpec = function (req, res) {

    var options = {
        url: this.config.host + this.config.apiRoot + '/schemas',
        method: 'GET',
        json: true,
        headers: { "X-Parse-Application-Id": this.config.appId, "X-Parse-Master-Key": this.config.masterKey }
    };

    request(options).then((data) => {
        var swagger = parseSchemaToSwagger(parseBaseSwaggerSpec, data.results);
        res.json(swagger);
    }).catch((error) => {
        res.send('Request failed with response code ' + error.status);
    });
}

module.exports = ParseSwagger;