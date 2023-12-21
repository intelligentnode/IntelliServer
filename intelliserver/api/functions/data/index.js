const express = require('express');
const path = require('path');
const axios = require('axios'); // Import the axios library
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

// Utility function to call the semantic search API
async function callSemanticSearchAPI(data) {
    
    try {
        // Replace 'YOUR_SEMANTIC_SEARCH_API_URL' with the actual URL
        const apiUrl = 'https://1cw9da6wl7.execute-api.us-east-2.amazonaws.com/semantic_search/';

        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            formData.append(key, data[key]);
        });
        
        // Make a POST request to the semantic search API
        const response = await axios.post(apiUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Set the content type to form-data
            },
        });
        console.log(response.data)
        
        // Return the semantic search results
        return response.data; // Adjust this based on the actual response format
    } catch (error) {
        throw new Error(`Error calling semantic search APIiii: ${error.message}`);
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

// New API route: data/chatbot
router.post('/chatbot', async (req, res, next) => {
    try {
        // const semanticSearchResponse = await callSemanticSearchAPI(req.body);

        // // return semanticSearchResponse;

        // console.log(semanticSearchResponse)

        // const chatbot = getChatbot(req);
        // const input = getChatInput(req.body.input, req.body.provider);
        // const functions = req.body.functions;
        // const function_call = req.body.function_call;

        // // Call the semantic search API here
        const semanticSearchResponse = await callSemanticSearchAPI(req.body);
        
        // Pass the semantic search results to the chatbot
        // input.addAssistantMessage(semanticSearchResponse);
        const concatenatedText = semanticSearchResponse.data.map(document => {
            return document.data.map(item => item.text).join(' ');
        }).join(' ');
        console.log(concatenatedText);
        req.body.input.messages[0].content = concatenatedText;
         const chatbot = getChatbot(req);
         const input = getChatInput(req.body.input, req.body.provider);
         const functions = req.body.functions;
         const function_call = req.body.function_call;
        

        // Call the chatbot API
          const results = await chatbot.chat(input, functions, function_call);
        res.json({ status: "OK", data: results });
    } catch (error) {
        console.log("this is error", error);
        res.json({ status: "ERROR", message: error.message });
    }
});

// New API route: data/search
router.post('/search', async (req, res, next) => {
    try {
        // Call the semantic search API here
        const semanticSearchResponse = await callSemanticSearchAPI(req.body);
        res.json({ status: "OK", data: semanticSearchResponse });
    } catch (error) {
        console.log("this is error", error);
        res.json({ status: "ERROR", message: error.message });
    }
});

module.exports = router;
