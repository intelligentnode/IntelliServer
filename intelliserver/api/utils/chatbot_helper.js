const path = require('path');
const { ChatGPTInput, LLamaReplicateInput, LLamaSageInput, CohereInput } = require('intellinode');
const { Chatbot, SupportedChatModels } = require('intellinode');
const { USE_DEFAULT_KEYS } = require(path.join(global.__basedir, 'config'));

class ChatbotHelpers {

    static getChatbot(req) {

        const keys = {
            'openai': process.env.OPENAI_API_KEY,
            'replicate': process.env.REPLICATE_API_KEY,
            'sagemaker': process.env.SAGEMAKER_API_KEY,
            'cohere': process.env.COHERE_API_KEY
        };

        const one_key = req.body.one_key;
        
        if (one_key) {
            // if the api connected with data.
            if (USE_DEFAULT_KEYS && !req.body.api_key) {
                return new Chatbot(keys[req.body.provider.toLowerCase()], 
                req.body.provider, null, {oneKey: one_key});
            } else {
                return new Chatbot(req.body.api_key, req.body.provider, null, {oneKey: one_key});
            }
        } else {
            if (USE_DEFAULT_KEYS && !req.body.api_key) {
                return new Chatbot(keys[req.body.provider.toLowerCase()], req.body.provider);
            } else {
                return new Chatbot(req.body.api_key, req.body.provider);
            }

        } /* check the one key */

    }

    static addMessages(chatInput, messages) {

        messages.forEach(msg => {
            if (msg.role.toLowerCase() === 'user') {
                chatInput.addUserMessage(msg.content);
            } else if (msg.role.toLowerCase() === 'assistant') {
                chatInput.addAssistantMessage(msg.content);
            } else {
                throw new Error(`Invalid message role: ${msg.role}`);
            }
        });

        return chatInput;
    }

    static getChatInput(input, provider) {

        const inputInst = input instanceof ChatGPTInput ? input :
            provider === SupportedChatModels.REPLICATE ? new LLamaReplicateInput(input.system, input) :
            provider === SupportedChatModels.SAGEMAKER ? new LLamaSageInput(input.system, input) :
            provider === SupportedChatModels.COHERE ? new CohereInput(input.system, input) :
            new ChatGPTInput(input.system, input);

        return ChatbotHelpers.addMessages(inputInst, input.messages);
        
    }
}

module.exports = ChatbotHelpers;