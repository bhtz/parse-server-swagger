parse-server-swagger
====================

Autogenerate parse server API swagger.json and swagger UI from Parse Server schemas

Installation (not ready yet)
------------

        npm i parse-server-swagger -S

How to use ?
------------

``` js

var ParseSwagger = require('parse-server-swagger');

// Serve swagger API documentation
if (CONFIG.swagger) {
    var parseSwagger = new ParseSwagger({
        host: 'http:localhost:1337',
        parsePath: '/parse'
        appId: '<appId>',
        masterKey: '<masterKey>',
    });

    app.use(parseSwagger);
}

```

Expose swagger UI here: 
    
    '/swagger'

Expose swagger.json here:
    
    '/api-docs'
