const express = require('express');
const path = require('path');
const router = express.Router();
const { RemoteEmbedModel, EmbedInput } = require('intellinode');
const { USE_DEFAULT_KEYS } = require(path.join(global.__basedir, 'config'));

const keys = {
    'openai': process.env.OPENAI_API_KEY,
    'cohere': process.env.COHERE_API_KEY,
    'replicate': process.env.REPLICATE_API_KEY
};

function getEmbedModel(req) {
    let apiKey, provider;
    
    if (USE_DEFAULT_KEYS && !req.body.api_key) {
        provider = req.body.provider.toLowerCase().trim();
        apiKey = keys[provider];
    } else {
        apiKey = req.body.api_key;
        provider = req.body.provider.toLowerCase().trim();
    }

    console.log('the provider is: ', provider);

    return new RemoteEmbedModel(apiKey, provider);
}

/**
 * @swagger
 * /embed:
 *   post:
 *     tags:
 *       - Embedding
 *     summary: Generate embeddings from text using supported models.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - api_key
 *               - provider
 *               - inputs
 *             properties:
 *               api_key:
 *                 type: string
 *                 description: The api key for the embedding provider
 *               provider:
 *                 type: string
 *                 description: The embedding provider (e.g. 'openai', 'cohere', 'replicate')
 *               inputs:
 *                 type: object
 *                 required:
 *                   - texts
 *                 properties:
 *                   texts:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: An array of texts to generate embeddings for
 *     responses:
 *       200:
 *         description: The generated embeddings
 *       400:
 *         description: There was a problem with the request
 */
router.post('/text', async (req, res) => {
    try {
        
        const embedModel = getEmbedModel(req);
        const inputJson = req.body.input;
        
        const inputEmbed = new EmbedInput(inputJson);
        inputEmbed.setDefaultValues(req.body.provider.toLowerCase().trim());
        const embeddings = await embedModel.getEmbeddings(inputEmbed);

        res.json({ status: "OK", data: embeddings });

    } catch (error) {
        res.status(400).json({ status: "ERROR", message: error.message });
    }
});

module.exports = router;