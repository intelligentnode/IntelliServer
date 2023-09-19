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

/**
 * @swagger
 * /chatcontext/getStringContext:
 *   post:
 *     tags:
 *       - Functions
 *     summary: Get the relevant messages for the chatbot conversation with simple string input. This is used to manage the chatbot window size.
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
 *               - provider
 *               - input
 *             properties:
 *               api_key:
 *                 type: string
 *                 description: The api key.
 *               provider:
 *                 type: string
 *                 description: The provider name (e.g. 'openai').
 *               input:
 *                 type: object
 *                 properties:
 *                   userMessage:
 *                     type: string
 *                     description: The user message to consider in the context.
 *                   historyMessages:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Array of previous messages in the conversation.
 *                   n:
 *                     type: integer
 *                     description: The number of last messages to be considered in the context.
 *     responses:
 *       200:
 *         description: The string context of the conversation considering last n messages with the user message.
 *       400:
 *         description: There was a problem with the request.
 */
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

/**
 * @swagger
 * /chatcontext/getRoleContext:
 *   post:
 *     tags:
 *       - Functions
 *     summary: Get the relevant messages for the chatbot conversation with dict input including the role. This is used to manage the chatbot window size.
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
 *               - provider
 *               - input
 *             properties:
 *               api_key:
 *                 type: string
 *                 description: The api key.
 *               provider:
 *                 type: string
 *                 description: The provider name (e.g. 'openai').
 *               input:
 *                 type: object
 *                 properties:
 *                   userMessage:
 *                     type: string
 *                     description: The user message to consider in the context.
 *                   historyMessages:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         role:
 *                           type: string
 *                           description: Role of the sender, either 'user' or 'assistant'
 *                         content:
 *                           type: string
 *                           description: Content of the message
 *                   n:
 *                     type: integer
 *                     description: The number of last messages to be considered in the context.
 *     responses:
 *       200:
 *         description: The role context of the conversation considering last n messages with the user message.
 *       400:
 *         description: There was a problem with the request.
 */
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