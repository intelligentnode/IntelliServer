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
      title: 'IntelliServer APIs',
      version: '0.0.1',
      description: 'AI model as scalable microservices, enabling evaluation of LLMs and offering end-to-end AI functions such as chatbot, semantic search, image generation and beyond.'
    },
  },
  apis: ['./api/**/*.js'],
};

const specs = swaggerJsdoc(options);
module.exports = specs;