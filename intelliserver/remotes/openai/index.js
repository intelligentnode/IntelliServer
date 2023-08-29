var express = require('express');
var router = express.Router();
const { OpenAIWrapper } = require('intellinode');

const { USE_DEFAULT_KEYS } = require('../../config');

/* GET api. */
router.get('/', function(req, res, next) {
  res.json({ status: "OK", message: "OpenAI Micro Service is active!" });
});

function getAPIWrapper(req) {

    if (USE_DEFAULT_KEYS) {
        return new OpenAIWrapper(process.env.OPENAI_API_KEY);
    } else {
        return new OpenAIWrapper(req.body.model_key);
    }
}

router.get('/text', async (req, res, next) => {
    try {
        const openai = getAPIWrapper(req);

        console.log('generate text parameters: ', req.body.params)

        const result = await openai.generateText(req.body.params);
        res.json({ status: "OK", data: result });
    } catch (error) {
        res.json({ status: "ERROR", message: error.message });
    }
});

router.get('/embeddings', async (req, res, next) => {
    try {
        const openai = getAPIWrapper(req);
        const result = await openai.getEmbeddings(req.body.params);
        res.json({ status: "OK", data: result });
    } catch (error) {
        res.json({ status: "ERROR", message: error.message });
    }
});

router.get('/images', async (req, res, next) => {
    try {
        const openai = getAPIWrapper(req);
        const result = await openai.generateImages(req.body.params);
        res.json({ status: "OK", data: result });
    } catch (error) {
        res.json({ status: "ERROR", message: error.message });
    }
});

router.get('/chat', async(req, res, next) => {
    try {
        const openai = getAPIWrapper(req);
        const result = await openai.generateChatText(req.body.params);
        const responseText = result['choices'][0]['message']['content'].trim();

        res.json({ status: "OK", data: { response: responseText } });
    } catch (error) {
        res.json({ status: "ERROR", message: error.message });
    }
});

module.exports = router;