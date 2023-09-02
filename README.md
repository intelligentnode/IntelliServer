# IntelliServer
AI models as microservice - ChatGPT, Cohere, Llama, Stability, Hugging inference and more.

Intelliserver is a microservice providing unified access to multiple AI models, allowing you to easily integrate cutting-edge AI into your project.


## Core Services

- **Chatbot**: chatbot functionalities using popular models like ChatGPT, Llama, and AWS Sagemaker models.
- **LLM Evaluation**: evaluate different AI models to choose the optimal solution for your requirements.
- **Semantic Search**: leverage context-aware semantic search capabilities across text documents.
- **Image Generation**: generate quality images based on described contexts using diffusion image models.

## Installation

**npm**
```bash
npm install
npm start
```
**docker**
```bash
# docker setup steps will be added
```

## Testing

To test Intelliserver, you can use the Postman API connector. You can find a endpoints collection in the [postman repository](https://github.com/intelligentnode/IntelliServer/tree/main/postman).

## Key Benefits

- **Unified Access:** Intelliserver provides a unified API for accessing different AI models. This allows for seamless switching between models using the same endpoint format.

- **Scalability:** Intelliserver utilizes microservices architecture, allowing the AI middleware to run as an independent service with dedicated resources.

- **Model Evaluation:** Intelliserver's design allows for seamless evaluation and comparison of different AI models using unified service. This facilitates data-driven decision when selecting the optimal model for specific use cases.

## License
Intelliserver is released under the [MIT License](https://github.com/intelligentnode/IntelliServer/blob/main/LICENSE)