// chatbot.js
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
 *       - Functions
 *     summary: chatbot as a service with multiple LLM providers like openai, replicate, azure and sageMaker.
 *     description: |
 *       Chatbot agent with multiple providers like openai, cohere, replicate, azure and more,
 *       providing a unified layer to access any model without changing your business application.
 *       You can connect the agent to your data using the one key from "intellinode.ai".
 *     security:
 *       - ApiKeyAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - api_key
 *               - model
 *               - provider
 *               - input
 *             properties:
 *               api_key:
 *                 type: string
 *                 description: The api key
 *               one_key:
 *                 type: string
 *                 description: optional value to use your intellinode documents in the chat.
 *               model:
 *                 type: string
 *                 description: The model type (e.g. 'gpt4').
 *               provider:
 *                 type: string
 *                 description: The provider (e.g. 'openai', 'cohere').
 *               input:
 *                 type: object
 *                 properties:
 *                  system:
 *                    type: string
 *                    description: System message to the chatbot.
 *                  messages:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        role:
 *                          type: string
 *                          description: Role of the sender, either 'user' or 'assistant'.
 *                        content:
 *                          type: string
 *                          description: Content of the message.
 *     responses:
 *       200:
 *         description: The chatbot's response.
 *       400:
 *         description: There was a problem with the request.
 */

router.post('/chat', async (req, res, next) => {
    try {
        const chatbot = ChatbotHelpers.getChatbot(req);
        const input = ChatbotHelpers.getChatInput(req.body.input, req.body.provider);
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
 *       - Functions
 *     summary: Stream chat responses in real-time.
 *     description: |
 *       Opens a streaming connection with the chatbot using the LLM providers like OpenAI,
 *       allowing clients to receive real-time responses as a stream. 
 *       Currently supports OpenAI provider only. For other providers, use the /chat endpoint.
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
 *                 description: The OpenAI api key. Required if not using default keys configured on the server.
 *               one_key:
 *                 type: string
 *                 description: Optional value to use your intellinode documents in the chat.
 *               model:
 *                 type: string
 *                 description: The model type (e.g. 'gpt-3.5-turbo').
 *               provider:
 *                 type: string
 *                 description: The provider must be 'openai'.
 *               input:
 *                 type: object
 *                 properties:
 *                   system:
 *                     type: string
 *                     description: System message to the chatbot.
 *                   messages:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         role:
 *                           type: string
 *                           description: Role of the sender, either 'user' or 'assistant'.
 *                         content:
 *                           type: string
 *                           description: Content of the message.
 *     responses:
 *       200:
 *         description: |
 *           Streams the chatbot's response. Each message is prefixed with "data: " as per the Server-Sent Events protocol.
 *       400:
 *         description: There was a problem with the request.
 *     produces:
 *       - text/event-stream
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
        const input = ChatbotHelpers.getChatInput(req.body.input, provider);
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