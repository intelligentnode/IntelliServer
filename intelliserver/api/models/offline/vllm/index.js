var express = require('express');
var path = require('path');
var router = express.Router();
const { VLLMWrapper, VLLMStreamParser } = require('intellinode');
const config = require(path.join(global.__basedir, 'config'));


/**
 * Helper function to create VLLMWrapper
 */
function getVLLMWrapper(req) {
  const serverLink = req.body.serverLink;
  if (!serverLink) {
    throw new Error("Missing 'serverLink' in the request body.");
  }
  return new VLLMWrapper(serverLink);
}

/**
 * @swagger
 * /offline/vllm/chat:
 *   post:
 *     tags:
 *       - Offline Models
 *     summary: Chat with a self-hosted vLLM model using VLLMWrapper.
 *     description: >
 *       Call the offline vLLM API directly using VLLMWrapper. Supports both standard and streaming responses.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serverLink
 *               - model
 *               - prompt
 *             properties:
 *               serverLink:
 *                 type: string
 *                 description: URL for the vLLM server (e.g. http://localhost:8000).
 *               model:
 *                 type: string
 *                 description: The vLLM model name (e.g. meta-llama/Llama-3.1-8B-Instruct).
 *               prompt:
 *                 type: string
 *                 description: The prompt to send.
 *               max_tokens:
 *                 type: number
 *                 default: 100
 *               temperature:
 *                 type: number
 *                 default: 0.7
 *               stream:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Chat response from the vLLM model.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error message.
 */
router.post('/chat', async (req, res) => {
  try {
    const { model, prompt, max_tokens, temperature, stream } = req.body;
    const vllm = getVLLMWrapper(req);

    const params = {
      model,
      prompt,
      max_tokens: max_tokens ?? null,
      temperature: temperature || 0.7,
      stream: !!stream
    };

    if (params.stream) {
      // Streaming response
      const responseStream = await vllm.generateText(params);
      const parser = new VLLMStreamParser();

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      for await (const chunk of responseStream) {
        const chunkText = chunk.toString('utf8');
        for await (const contentText of parser.feed(chunkText)) {
          res.write(`data: ${contentText}\n\n`);
        }
      }
      res.end();
    } else {
      // Standard (non-streaming) response
      const result = await vllm.generateText(params);
      const outputs = result.choices.map(c => c.text.trim());
      res.json({ status: 'OK', data: outputs });
    }
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

/**
 * @swagger
 * /offline/vllm/embeddings:
 *   post:
 *     tags:
 *       - Offline Models
 *     summary: Generate embeddings using a self-hosted vLLM model.
 *     description: >
 *       Call the offline vLLM embeddings API to generate text embeddings.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serverLink
 *               - texts
 *             properties:
 *               serverLink:
 *                 type: string
 *                 description: URL for the vLLM embeddings server (e.g. http://localhost:8001).
 *               texts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of texts to generate embeddings for.
 *     responses:
 *       200:
 *         description: Embeddings generated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *       500:
 *         description: Error message.
 */
router.post('/embeddings', async (req, res) => {
  try {
    const { serverLink, texts } = req.body;
    const wrapper = new VLLMWrapper(serverLink);
    const response = await wrapper.getEmbeddings(texts);
    res.json({ status: 'OK', data: response });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

module.exports = router;
