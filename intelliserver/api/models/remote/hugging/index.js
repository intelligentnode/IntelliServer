var express = require('express');
var path = require('path');
var router = express.Router();

const { HuggingWrapper } = require('intellinode');
const { USE_DEFAULT_KEYS } = require(path.join(global.__basedir, 'config'));

function getAPIWrapper(req) {
  if (USE_DEFAULT_KEYS && !req.body.api_key) {
    return new HuggingWrapper(process.env.HUGGING_API_KEY);
  } else {
    return new HuggingWrapper(req.body.api_key);
  }
}

/**
 * @swagger
 * /hugging/text:
 *   post:
 *     tags:
 *       - Models
 *     summary: Generates text using Hugging Face's language models.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - params
 *             properties:
 *               params:
 *                 type: object
 *                 properties:
 *                   model_id:
 *                     type: string
 *                     description: The model_id of the language model to be used.
 *                   data:
 *                     type: string
 *                     description: The data to be processed by the language model.
 *     responses:
 *       200:
 *         description: The generated text from Hugging Face.
 *       400:
 *         description: There was a problem with the request.
 */
router.post('/text', async (req, res, next) => {
  try {
    const hugging = getAPIWrapper(req);
    const result = await hugging.generateText(req.body.params.model_id, req.body.params.data);
    res.json({ status: "OK", data: result });
  } catch (error) {
    res.json({ status: "ERROR", message: error.message });
  }
});

/**
 * @swagger
 * /hugging/images:
 *   post:
 *     tags:
 *       - Models
 *     summary: Generates images using Hugging Face's image models.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - params
 *             properties:
 *               params:
 *                 type: object
 *                 properties:
 *                   model_id:
 *                     type: string
 *                     description: The model_id for the image model to be used.
 *                   data:
 *                     type: string
 *                     description: The data to be processed by the image model.
 *     responses:
 *       200:
 *         description: The generated image from Hugging Face.
 *       400:
 *         description: There was a problem with the request.
 */
router.post('/images', async (req, res, next) => {
  try {
    const hugging = getAPIWrapper(req);
    const result = await hugging.generateImage(req.body.params.model_id, req.body.params.data);
    res.json({ status: "OK", data: result });
  } catch (error) {
    res.json({ status: "ERROR", message: error.message });
  }
});

module.exports = router;