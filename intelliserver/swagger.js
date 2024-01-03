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
      version: '0.1.0',
      description: 'IntelliServer is a microservice framework providing a scalable interface to various AI tasks like chatting, semantic search, image generation, OCR, and beyond. It enables easy integration of various Large Models and other AI functionalities. Users can deploy IntelliServer locally or in the cloud and utilize its API to enhance their business applications with cutting-edge AI capabilities. You can use Intellinode cloud to upload your docs and augment the AI models with your data using one key concept.'
    },
  },
  apis: ['./api/**/*.js'],
};

const specs = swaggerJsdoc(options);
module.exports = specs;