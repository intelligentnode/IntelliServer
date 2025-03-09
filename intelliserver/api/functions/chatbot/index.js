const express = require('express');
var path = require('path');
const router = express.Router();
const { ChatGPTInput, LLamaReplicateInput, LLamaSageInput, CohereInput } = require('intellinode');
const { Chatbot, SupportedChatModels } = require('intellinode');
const { USE_DEFAULT_KEYS } = require(path.join(global.__basedir, 'config'));
const ChatbotHelpers = require('../../utils/chatbot_helper');

/**
 * @swagger
 * /chatbot/chat:
 *   post:
 *     tags:
 *       - Data
 *     summary: Chatbot as a service with support for multiple LLM providers, including vLLM.
 *     description: |
 *       Provides access to a unified chatting layer compatible with major LLM providers including OpenAI, Cohere, Replicate, Azure, SageMaker, and vLLM.
 *       When using the vLLM provider, include the "serverLink" parameter in the request body to specify the vLLM server URL.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - model
 *               - provider
 *               - input
 *             properties:
 *               api_key:
 *                 type: string
 *                 description: The API key required by the LLM provider. (Not required for vLLM)
 *               serverLink:
 *                 type: string
 *                 description: Required for the vLLM provider. The URL of the vLLM server (e.g., "http://localhost:8000").
 *               one_key:
 *                 type: string
 *                 description: Optional. Allows the inclusion of intellinode documents in the chat context.
 *               model:
 *                 type: string
 *                 description: Identifier for the LLM model to use (e.g., "gpt-3.5-turbo", "gpt4", "mistral-medium", "meta-llama/Llama-3.1-8B-Instruct").
 *               provider:
 *                 type: string
 *                 description: The LLM provider (e.g., "openai", "gemini", "cohere", "azure", "replicate", "sageMaker", "mistral", "vllm").
 *               input:
 *                 type: object
 *                 properties:
 *                   system:
 *                     type: string
 *                     description: System-initiated message or command to the chatbot.
 *                   messages:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         role:
 *                           type: string
 *                           description: Role of the sender, either "user" or "assistant".
 *                         content:
 *                           type: string
 *                           description: Content of the message sent to the chatbot.
 *     responses:
 *       200:
 *         description: The chatbot's response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["The response from the chatbot."]
 *                 reference:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["document name"]
 *       400:
 *         description: There was a problem with the request.
 *
 */
router.post('/chat', async (req, res, next) => {
    try {
        const chatbot = ChatbotHelpers.getChatbot(req);
        const input = ChatbotHelpers.getChatInput(req.body.input, req.body.provider, req.body.model);
        const functions = req.body.functions;
        const function_call = req.body.function_call;
        const responses = await chatbot.chat(input, functions, function_call);
        res.json({ status: "OK", data: responses.result, reference: Object.keys(responses.references) });  
    } catch (error) {
        console.log("this is error",error);
        res.json({ status: "ERROR", message: error.message });
    }
});

/**
 * @swagger
 * /chatbot/stream:
 *   post:
 *     tags:
 *       - Data
 *     summary: Stream chat responses in real-time from supported LLM providers, including vLLM.
 *     description: |
 *       Offers a streaming connection for real-time chatbot responses. Supported providers for streaming are OpenAI and vLLM.
 *       When using vLLM, include the "serverLink" parameter in the request body to specify the vLLM server URL.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - model
 *               - provider
 *               - input
 *             properties:
 *               api_key:
 *                 type: string
 *                 description: The API key. (Not required for vLLM)
 *               serverLink:
 *                 type: string
 *                 description: Required for the vLLM provider. The URL of the vLLM server.
 *               one_key:
 *                 type: string
 *                 description: Optional. Enables usage of intellinode documents in the chat.
 *               model:
 *                 type: string
 *                 description: The LLM model type (e.g., "gpt-3.5-turbo", "mistralai/Mistral-7B-Instruct-v0.2", or a vLLM model identifier).
 *               provider:
 *                 type: string
 *                 description: The LLM provider. For streaming, supported providers are "openai" and "vllm".
 *               input:
 *                 type: object
 *                 properties:
 *                   system:
 *                     type: string
 *                     description: Initial system message to the chatbot.
 *                   messages:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         role:
 *                           type: string
 *                           description: The sender's role, either "user" or "assistant".
 *                         content:
 *                           type: string
 *                           description: The message content for the chatbot.
 *     responses:
 *       200:
 *         description: Streams the chatbot's response according to the Server-Sent Events protocol.
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 *                   example: "The response from the chatbot."
 *       400:
 *         description: There was a problem with the request.
 *     produces:
 *       - text/event-stream
 *
 */
router.post('/stream', async (req, res, next) => {
    try {
        
        let provider = req.body.provider;
        // validate
        if (SupportedChatModels.OPENAI != provider.toLowerCase()) {
            res.json({ status: "ERROR", message: "stream support openai only, for other providers call /chat api" });
        }
        // process
        const chatbot = ChatbotHelpers.getChatbot(req);
        const input = ChatbotHelpers.getChatInput(req.body.input, req.body.provider, req.body.model);
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();
        for await (const token of chatbot.stream(input)) {
            res.write(`data: ${token}\n\n`);
        }
        res.end();
    } catch (error) {
        next(error);
        res.end();
    }
});

module.exports = router;