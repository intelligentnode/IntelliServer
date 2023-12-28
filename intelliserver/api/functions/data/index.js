const express = require('express');
const path = require('path');
const axios = require('axios');
const router = express.Router();
const { ChatGPTInput, LLamaReplicateInput, LLamaSageInput, CohereInput } = require('intellinode');
const { Chatbot, SupportedChatModels } = require('intellinode');
const { USE_DEFAULT_KEYS } = require(path.join(global.__basedir, 'config'));

const keys = {
    'openai': process.env.OPENAI_API_KEY,
    'replicate': process.env.REPLICATE_API_KEY,
    'sagemaker': process.env.SAGEMAKER_API_KEY,
    'cohere': process.env.COHERE_API_KEY
};

async function callSemanticSearchAPI(data) {
    try {

        const apiUrl = process.env.SEMANTIC_SEARCH_API_URL;
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            formData.append(key, data[key]);
        });
        const response = await axios.post(apiUrl, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });


        return response.data;
    } catch (error) {
        throw new Error(`Error calling semantic search API: ${error.message}`);
    }
}

function getChatbot(req) {
    console.log('getChatbot provider: ', req.body.provider);
    if (USE_DEFAULT_KEYS && !req.body.api_key) {
        return new Chatbot(keys[req.body.provider.toLowerCase()], req.body.provider);
    } else {
        return new Chatbot(req.body.api_key, req.body.provider);
    }
}

function addMessages(chatInput, messages) {
    messages.forEach(msg => {
        if (msg.role.toLowerCase() === "user") {
            chatInput.addUserMessage(msg.content);
        } else if (msg.role.toLowerCase() === "assistant") {
            chatInput.addAssistantMessage(msg.content);
        } else {
            throw new Error(`Invalid message role: ${msg.role}`);
        }
    });
    return chatInput;
}

function getChatInput(input, provider) {
    const inputInst = input instanceof ChatGPTInput ? input :
        provider === SupportedChatModels.REPLICATE ? new LLamaReplicateInput(input.system, input) :
        provider === SupportedChatModels.SAGEMAKER ? new LLamaSageInput(input.system, input) :
        provider === SupportedChatModels.COHERE ? new CohereInput(input.system, input) :
            new ChatGPTInput(input.system, input);

    return addMessages(inputInst, input.messages);
}



/**
 * @swagger
 * /data/chatbot:
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






// New API route: data/chatbot
router.post('/chatbot', async (req, res, next) => {
    try {
        // Call the semantic search API asynchronously
        const lastMessage=req.body.input.messages[req.body.input.messages.length - 1].content;
        console.log(lastMessage);

        const semanticSearchData = {
            one_key: 'ince37408f',
            query_text: lastMessage,
            k: "2",
        };

        const semanticSearchResponse = await callSemanticSearchAPI(semanticSearchData);

        // Concatenate the text from response data
        const concatenatedText = semanticSearchResponse.data.map(document => {
            return document.data.map(item => item.text).join(' ');
        }).join(' ');
       
        // req.body.input.messages[0].content = concatenatedText  ;
        req.body.input.messages[req.body.input.messages.length - 1].content=concatenatedText;


       // Now, call the chatbot API
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

// New API route: data/semantic_search
router.post('/semantic_search', async (req, res, next) => {
    try {
        const semanticSearchResponse = await callSemanticSearchAPI(req.body);
        res.json({ status: "OK", data: semanticSearchResponse });
    } catch (error) {
        res.json({ status: "ERROR", message: error.message });
    }
});

module.exports = router;
