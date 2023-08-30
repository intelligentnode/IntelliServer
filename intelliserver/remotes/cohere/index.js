// cohere.js
var express = require('express');
var router = express.Router();

const { CohereAIWrapper } = require('intellinode');
const { USE_DEFAULT_KEYS } = require('../../config');

function getAPIWrapper(req) {
  if (USE_DEFAULT_KEYS) {
    return new CohereAIWrapper(process.env.COHERE_API_KEY);
  } else {
    return new CohereAIWrapper(req.body.api_key);
  }
}

router.get('/text', async (req, res, next) => {
    try {
        const cohere = getAPIWrapper(req);

        const result = await cohere.generateText(req.body.params);

        res.json({ status: "OK", data: result.generations });

    } catch (error) {
        res.json({ status: "ERROR", message: error.message });
    }
});

router.get('/embeddings', async (req, res, next) => {
    try {
        const cohere = getAPIWrapper(req);

        const result = await cohere.getEmbeddings(req.body.params);

        res.json({ status: "OK", data: result.embeddings });
    } catch (error) {
        res.json({ status: "ERROR", message: error.message });
    }
});

module.exports = router;