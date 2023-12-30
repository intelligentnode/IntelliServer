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

        // Load the template file
        const templateContent = await fs.readFile(templatePath, 'utf-8');

        // Replace placeholders with actual data
        const context = templateContent
            .replace('<semantic_search>', concatenatedText)
            .replace('<query>', lastMessage)
       
        // req.body.input.messages[0].content = concatenatedText  ;
        req.body.input.messages[req.body.input.messages.length - 1].content=context;


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
