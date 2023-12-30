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
 *
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
 *               model:
 *                 type: string
 *                 description: The model type (e.g. 'gpt4')
 *               provider:
 *                 type: string
 *                 description: The provider (e.g. 'openai')
 *               input:
 *                 type: object
 *                 properties:
 *                  system:
 *                    type: string
 *                    description: System message to the chatbot
 *                  messages:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        role:
 *                          type: string
 *                          description: Role of the sender, either 'user' or 'assistant'
 *                        content:
 *                          type: string
 *                          description: Content of the message
 *     responses:
 *       200:
 *         description: The chatbot's response
 *       400:
 *         description: There was a problem with the request
 */

router.post('/chat', async (req, res, next) => {
    console.log("this is result",req)
    try {
        const chatbot = ChatbotHelpers.getChatbot(req);
        const input = ChatbotHelpers.getChatInput(req.body.input, req.body.provider);
        const functions = req.body.functions;
        const function_call = req.body.function_call;
        const results = await chatbot.chat(input, functions, function_call);
        res.json({ status: "OK", data: results });  
    } catch (error) {
        console.log("this is error",error);
        res.json({ status: "ERROR", message: error.message });
    }
});

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