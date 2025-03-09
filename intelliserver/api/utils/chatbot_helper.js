const path = require('path');
const {
  ChatGPTInput,
  LLamaReplicateInput,
  LLamaSageInput,
  CohereInput,
  GeminiInput,
  MistralInput,
  VLLMInput,
  AnthropicInput
} = require('intellinode');
const { Chatbot, SupportedChatModels } = require('intellinode');
const { USE_DEFAULT_KEYS } = require(path.join(global.__basedir, 'config'));

class ChatbotHelpers {

    static getChatbot(req) {
        const provider = req.body.provider ? req.body.provider.toLowerCase() : null;
        if (!provider) {
          throw new Error("Missing 'provider' in request body.");
        }

        // Map of default keys
        const keys = {
          'openai': process.env.OPENAI_API_KEY,
          'replicate': process.env.REPLICATE_API_KEY,
          'sagemaker': process.env.SAGEMAKER_API_KEY,
          'cohere': process.env.COHERE_API_KEY,
          'mistral': process.env.MISTRAL_API_KEY,
          'gemini': process.env.GEMINI_API_KEY,
          'vllm': process.env.VLLM_API_KEY,
          'anthropic': process.env.ANTHROPIC_API_KEY
        };

        // Get one_key if available
        const oneKey = req.body.one_key || process.env.ONE_KEY;

        // Get any custom IntelliBase setting
        const customIntelliBaseEnv = process.env.INTELLIBASE;
        const intelliBaseUrl = req.body.intelliBase || customIntelliBaseEnv || null;

        // For optional RAG
        let options = {};
        if (oneKey) {
          options.oneKey = oneKey;
          if (intelliBaseUrl) {
            options.intelliBase = intelliBaseUrl;
          }
        }

        // vLLM provider
        if (provider === SupportedChatModels.VLLM) {
          const baseUrl = req.body.serverLink;
          if (!baseUrl) {
            throw new Error("vLLM provider requires a 'serverLink' parameter.");
          }
          options.baseUrl = baseUrl;
          return new Chatbot(null, SupportedChatModels.VLLM, null, options);
        } else {
          if (oneKey) {
            if (USE_DEFAULT_KEYS && !req.body.api_key) {
              return new Chatbot(keys[provider], provider, null, options);
            } else {
              return new Chatbot(req.body.api_key, provider, null, options);
            }
          } else {
            if (USE_DEFAULT_KEYS && !req.body.api_key) {
              return new Chatbot(keys[provider], provider);
            } else {
              return new Chatbot(req.body.api_key, provider);
            }
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

    static getChatInput(input, provider, topLevelModel) {
        input.attachReference = true;
        if (!input.model && topLevelModel) {
            input.model = topLevelModel;
        }
        let inputInst;
        switch (provider.toLowerCase()) {
          case SupportedChatModels.VLLM:
            inputInst = (input instanceof VLLMInput)
              ? input
              : new VLLMInput(input.system, input);
            break;
          case SupportedChatModels.REPLICATE:
            inputInst = (input instanceof LLamaReplicateInput)
              ? input
              : new LLamaReplicateInput(input.system, input);
            break;
          case SupportedChatModels.SAGEMAKER:
            inputInst = (input instanceof LLamaSageInput)
              ? input
              : new LLamaSageInput(input.system, input);
            break;
          case SupportedChatModels.COHERE:
            inputInst = (input instanceof CohereInput)
              ? input
              : new CohereInput(input.system, input);
            break;
          case SupportedChatModels.MISTRAL:
            inputInst = (input instanceof MistralInput)
              ? input
              : new MistralInput(input.system, input);
            break;
          case SupportedChatModels.GEMINI:
            inputInst = (input instanceof GeminiInput)
              ? input
              : new GeminiInput(input.system, input);
            break;
          case SupportedChatModels.ANTHROPIC:
            inputInst = (input instanceof AnthropicInput)
              ? input
              : new AnthropicInput(input.system, input);
            break;
          default:
            inputInst = (input instanceof ChatGPTInput)
              ? input
              : new ChatGPTInput(input.system, input);
        }
        return ChatbotHelpers.addMessages(inputInst, input.messages);
    }

}

module.exports = ChatbotHelpers;
