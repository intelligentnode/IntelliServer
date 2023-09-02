// chatbot.js
const express = require('express');
var path = require('path');
const router = express.Router();
const { ChatGPTInput, LLamaReplicateInput, LLamaSageInput } = require('intellinode');
const { Chatbot, SupportedChatModels } = require('intellinode');
const { USE_DEFAULT_KEYS } = require(path.join(global.__basedir, 'config'));

const keys = {
    'openai': process.env.OPENAI_API_KEY,
    'replicate': process.env.REPLICATE_API_KEY,
    'sagemaker': process.env.SAGEMAKER_API_KEY
}

function getChatbot(req) {
    console.log('getChatbot provider: ', req.body.provider)
    if (USE_DEFAULT_KEYS && !req.body.api_key) {
        return new Chatbot(keys[req.body.provider.toLowerCase()], req.body.provider);
    } else {
        return new Chatbot(req.body.api_key, req.body.provider);
    }
}

function addMessages(chatInput, messages) {
    messages.forEach(msg => {
        if(msg.role.toLowerCase() === "user") {
            chatInput.addUserMessage(msg.content);
        }
        else if (msg.role.toLowerCase() === "assistant") {
            chatInput.addAssistantMessage(msg.content);
        }
        else {
            throw new Error(`Invalid message role: ${msg.role}`);
        }
    });
    return chatInput;
}

function getChatInput(input, provider) {
    const inputInst = input instanceof ChatGPTInput ? input :
        provider === SupportedChatModels.REPLICATE ? new LLamaReplicateInput(input.system, input) :
        provider === SupportedChatModels.SAGEMAKER ? new LLamaSageInput(input.system, input) :
        new ChatGPTInput(input.system, input);

    return addMessages(inputInst, input.messages);
}

router.post('/chat', async (req, res, next) => {
    try {
        const chatbot = getChatbot(req);
        const input = getChatInput(req.body.input, req.body.provider);
        const functions = req.body.functions;
        const function_call = req.body.function_call;
        const results = await chatbot.chat(input, functions, function_call);
        res.json({ status: "OK", data: results });
    } catch (error) {
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
        const chatbot = getChatbot(req);
        const input = getChatInput(req.body.input, provider);
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