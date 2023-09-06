<p align="center">
<img src="images/server-header.png" width="600em">
</p>
<p align="center">
<a href="https://discord.gg/VYgCh2p3Ww" alt="licenses tag">
    <img src="https://img.shields.io/badge/Discord-Community-light?style=flat-square" />
</a>
</p>

# IntelliServer
AI models as private microservice - ChatGPT, Cohere, Llama, Stability, Hugging inference and more.

Intelliserver is a microservice providing unified access to multiple AI models, allowing you to easily integrate cutting-edge AI into your project.


## Core Services

- **Chatbot**: chatbot functionalities using popular models like ChatGPT, Llama, and AWS Sagemaker models.
- **LLM Evaluation**: evaluate different AI models to choose the optimal solution for your requirements.
- **Semantic Search**: leverage context-aware semantic search capabilities across text documents.
- **Image Generation**: generate quality images based on described contexts using diffusion image models.

## Installation

### Repository
**npm**
```bash
cd intelliserver
npm install
npm start
```
**docker**
- docker run command
```bash
docker build -t intelliserver:latest .
docker run -p 80:80 intelliserver:latest
```
- docker compose run
```bash
docker-compose up
```

### Release (Docker Hub)
```bash
docker pull intellinode/intelliserver:latest
docker run -p 80:80 intellinode/intelliserver:latest
```

## Testing

To test Intelliserver, you can use the Postman API connector. You can find a endpoints collection in the [postman repository](https://github.com/intelligentnode/IntelliServer/tree/main/postman).

## Key Benefits

- **Unified Access:** Intelliserver provides a unified API for accessing different AI models. This allows for seamless switching between models using the same endpoint format.

- **Scalability:** Intelliserver utilizes microservices architecture, allowing the AI middleware to run as an independent service with dedicated resources.

- **Model Evaluation:** Intelliserver's design allows for seamless evaluation and comparison of different AI models using unified service. This facilitates data-driven decision when selecting the optimal model for specific use cases.

## License
Intelliserver is released under the [MIT License](https://github.com/intelligentnode/IntelliServer/blob/main/LICENSE)
