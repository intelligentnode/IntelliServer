// data.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const router = express.Router();
const { ChatGPTInput, LLamaReplicateInput, LLamaSageInput, CohereInput } = require('intellinode');
const { Chatbot, SupportedChatModels } = require('intellinode');
const { USE_DEFAULT_KEYS } = require(path.join(global.__basedir, 'config'));
const ChatbotHelpers = require('../../utils/chatbot_helper');
const templatePath = path.join(__dirname, '../../../assets/query_template.txt');

async function callSemanticSearchAPI(data) {
    console.log("this is data",data);
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
        console.log(error)
        throw new Error(`Error calling semantic search API: ${error.message}`);
    }
}

router.post('/chatbot', async (req, res, next) => {
    try {
        // Call the semantic search API asynchronously
        const lastMessage=req.body.input.messages[req.body.input.messages.length - 1].content;
        console.log(req.body.one_key);

        const oneKey = req.body.one_key||process.env.SEMANTIC_SEARCH_ONE_KEY;

        const k = req.body.k||process.env.SEMANTIC_SEARCH_K;

        if(req.body.isDataConnected == 'true'){

            const semanticSearchData = { one_key: oneKey, query_text: lastMessage, k: k };
      
        const semanticSearchResponse = await callSemanticSearchAPI(semanticSearchData);

        // Concatenate the text from response data
        const concatenatedText = semanticSearchResponse.data.map(document => {
            return document.data.map(item => item.text).join(' ');
        }).join(' ');

        // Load the template file
        const templateContent = await fs.readFile(templatePath, 'utf-8');

        // Replace placeholders with actual data
        const context = templateContent
            .replace('<semantic_search>', concatenatedText)
            .replace('<query>', lastMessage)
       
        // req.body.input.messages[0].content = concatenatedText  ;
        req.body.input.messages[req.body.input.messages.length - 1].content=context;
        }

        
       // Now, call the chatbot API
        const chatbot = ChatbotHelpers.getChatbot(req);
        const input = ChatbotHelpers.getChatInput(req.body.input, req.body.provider);
        const functions = req.body.functions;
        const function_call = req.body.function_call;
        const results = await chatbot.chat(input, functions, function_call);

        res.json({ status: "OK", data: results });
    } catch (error) {
        res.json({ status: "ERROR", message: error.message });
    }
});

// Stream Api 
router.post('/stream', async (req, res, next) => {
    try {
        const lastMessage=req.body.input.messages[req.body.input.messages.length - 1].content;

        const oneKey = req.body.one_key||process.env.SEMANTIC_SEARCH_ONE_KEY;

        const k = req.body.k||process.env.SEMANTIC_SEARCH_K;

        if(req.body.isDataConnected){
            const semanticSearchData = { one_key: oneKey, query_text: lastMessage, k: k };
      
        const semanticSearchResponse = await callSemanticSearchAPI(semanticSearchData);

        // Concatenate the text from response data
        const concatenatedText = semanticSearchResponse.data.map(document => {
            return document.data.map(item => item.text).join(' ');
        }).join(' ');

        // Load the template file
        const templateContent = await fs.readFile(templatePath, 'utf-8');

        // Replace placeholders with actual data
        const context = templateContent
            .replace('<semantic_search>', concatenatedText)
            .replace('<query>', lastMessage)
       
        // req.body.input.messages[0].content = concatenatedText  ;
        req.body.input.messages[req.body.input.messages.length - 1].content=context;
        }
        
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
