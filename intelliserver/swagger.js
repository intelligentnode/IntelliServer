const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-KEY'
        },
      }
    },
    info: {
      title: 'IntelliServer APIs', // Title (required)
      version: '0.0.1',
    },
  },
  apis: ['./api/**/*.js'],
};

const specs = swaggerJsdoc(options);
module.exports = specs;