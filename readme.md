parse-server-swagger
====================

Autogenerate parse server API openapi.json and swagger UI from Parse Server schemas.

Installation
------------

        npm i parse-server-swagger -S

How to use ?
------------

This assumes that `Parse` is initialized with a master key.

``` js

const ParseSwagger = require('parse-server-swagger');

// Serve swagger API documentation
if (CONFIG.swagger) {
    const parseSwagger = new ParseSwagger({
        serverURL: "https://yourServerUrl/parse",
        appId: "yourAppId",
        masterKey: "yourMasterKey",

    });
    app.use(parseSwagger);
}

```

Expose swagger UI here: 
    
    '/api-docs'

Expose swagger.json here:
    
    '/openapi.json'
