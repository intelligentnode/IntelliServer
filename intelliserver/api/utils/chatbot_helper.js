const path = require('path');
const {
  ChatGPTInput,
  LLamaReplicateInput,
  LLamaSageInput,
  CohereInput,
  GeminiInput,
  MistralInput
} = require('intellinode');
const { Chatbot, SupportedChatModels } = require('intellinode');
const { USE_DEFAULT_KEYS } = require(path.join(global.__basedir, 'config'));

class ChatbotHelpers {

    static getChatbot(req) {
        // Map of default keys
        const keys = {
            'openai': process.env.OPENAI_API_KEY,
            'replicate': process.env.REPLICATE_API_KEY,
            'sagemaker': process.env.SAGEMAKER_API_KEY,
            'cohere': process.env.COHERE_API_KEY,
            'mistral': process.env.MISTRAL_API_KEY,
            'gemini': process.env.GEMINI_API_KEY
        };

        // The one_key from request body or fallback to env
        const oneKey = req.body.one_key || process.env.ONE_KEY;

        // Check environment for custom IntelliBase
        const customIntelliBaseEnv = process.env.INTELLIBASE;

        // If the user explicitly passed intelliBase, overrides the env variable
        let intelliBaseUrl = null;
        if (req.body.intelliBase) {
          intelliBaseUrl = req.body.intelliBase;
        } else if (customIntelliBaseEnv) {
          intelliBaseUrl = customIntelliBaseEnv;
        }

        // Build the Chatbot instance
        if (oneKey) {
            // If oneKey is present, activate RAG
            let options = { oneKey: oneKey };
            if (intelliBaseUrl) {
                options.intelliBase = intelliBaseUrl;
            }

            if (USE_DEFAULT_KEYS && !req.body.api_key) {
                return new Chatbot(
                    keys[req.body.provider.toLowerCase()],
                    req.body.provider,
                    null,
                    options
                );
            } else {
                return new Chatbot(
                    req.body.api_key,
                    req.body.provider,
                    null,
                    options
                );
            }
        } else {
            // If no oneKey, no RAG
            if (USE_DEFAULT_KEYS && !req.body.api_key) {
                return new Chatbot(
                    keys[req.body.provider.toLowerCase()],
                    req.body.provider
                );
            } else {
                return new Chatbot(req.body.api_key, req.body.provider);
            }
        }
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
        // Attach references
        input.attachReference = true;

        const inputInst = (input instanceof ChatGPTInput)
            ? input
            : provider === SupportedChatModels.REPLICATE
                ? new LLamaReplicateInput(input.system, input)
            : provider === SupportedChatModels.SAGEMAKER
                ? new LLamaSageInput(input.system, input)
            : provider === SupportedChatModels.COHERE
                ? new CohereInput(input.system, input)
            : provider === SupportedChatModels.MISTRAL
                ? new MistralInput(input.system, input)
            : provider === SupportedChatModels.GEMINI
                ? new GeminiInput(input.system, input)
            : new ChatGPTInput(input.system, input);

        return ChatbotHelpers.addMessages(inputInst, input.messages);
    }
}

module.exports = ChatbotHelpers;