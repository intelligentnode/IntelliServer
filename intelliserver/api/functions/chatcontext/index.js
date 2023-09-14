const express = require('express');
var path = require('path');
const router = express.Router();
const { ChatContext, SupportedEmbedModels } = require('intellinode');
const { USE_DEFAULT_KEYS } = require(path.join(global.__basedir, 'config'));

const keys = {
  'openai': process.env.OPENAI_API_KEY,
  'cohere': process.env.COHERE_API_KEY,
};

function getChatContext(req) {
  if (USE_DEFAULT_KEYS && !req.body.api_key) {
    return new ChatContext(keys[req.body.provider.toLowerCase()], req.body.provider);
  } else {
    return new ChatContext(req.body.api_key, req.body.provider);
  }
}

router.post('/getStringContext', async (req, res, next) => {
  try {
    const chatContext = getChatContext(req);
    const userMessage = req.body.input.userMessage;
    const historyMessages = req.body.input.historyMessages;
    const n = req.body.input.n;
    const resultContext = await chatContext.getStringContext(userMessage, historyMessages, n);
    res.json({ status: "OK", context: resultContext });
  } catch (error) {
    res.json({ status: "ERROR", message: error.message });
  }
});

router.post('/getRoleContext', async (req, res, next) => {
  try {
    const chatContext = getChatContext(req);
    const userMessage = req.body.input.userMessage;
    const historyMessages = req.body.input.historyMessages;
    const n = req.body.input.n;
    const resultContext = await chatContext.getRoleContext(userMessage, historyMessages, n);
    res.json({ status: "OK", context: resultContext });
  } catch (error) {
    res.json({ status: "ERROR", message: error.message });
  }
});

module.exports = router;