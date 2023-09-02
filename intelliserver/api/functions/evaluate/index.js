const express = require('express');
var path = require('path');
const router = express.Router();
const { LLMEvaluation } = require('intellinode');
const { USE_DEFAULT_KEYS } = require(path.join(global.__basedir, 'config'));
require('dotenv').config();

const keys = {
  'openai': process.env.OPENAI_API_KEY,
  'cohere': process.env.COHERE_API_KEY,
  'replicate': process.env.REPLICATE_API_KEY,
  'huggingface': process.env.HUGGING_API_KEY,
};

function getModelSettings(input) {
  return input.map((item) => {
    return {
      ...item,
      apiKey: (!USE_DEFAULT_KEYS && item.apiKey) ? item.apiKey : keys[item.provider.toLowerCase()],
    };
  });
}

function getLLMEvaluation(req) {
  const apiKey = (!USE_DEFAULT_KEYS && req.body.semantic.api_key) ?
                 req.body.semantic.api_key :
                 keys[req.body.semantic.provider.toLowerCase()];
  return new LLMEvaluation(apiKey, req.body.semantic.provider);
}

router.post('/llm', async (req, res, next) => {
  try {
    const llmEvaluation = getLLMEvaluation(req);
    const userInput = req.body.userInput;
    const targetAnswers = req.body.targetAnswers;
    const models = getModelSettings(req.body.evaluate);

    console.log('models input: ', models)

    const results = await llmEvaluation.compareModels(userInput, targetAnswers, models);
    res.json({ status: 'OK', results: results });
  } catch (error) {
    res.json({ status: 'ERROR', message: error.message });
  }
});

module.exports = router;