// openai.js
var express = require('express');
var path = require('path');
var router = express.Router();

const { OpenAIWrapper, GPTStreamParser } = require('intellinode');
const { USE_DEFAULT_KEYS } = require(path.join(global.__basedir, 'config'));

/* GET api. */
router.get('/', function(req, res, next) {
  res.json({ status: "OK", message: "OpenAI Micro Service is active!" });
});

function getAPIWrapper(req) {

    if (USE_DEFAULT_KEYS && !req.body.api_key) {
        return new OpenAIWrapper(process.env.OPENAI_API_KEY);
    } else {
        return new OpenAIWrapper(req.body.api_key);
    }
}

router.post('/text', async (req, res, next) => {
    try {
        const openai = getAPIWrapper(req);

        const result = await openai.generateText(req.body.params);
        res.json({ status: "OK", data: result });
    } catch (error) {
        res.json({ status: "ERROR", message: error.message });
    }
});

router.post('/embeddings', async (req, res, next) => {
    try {
        const openai = getAPIWrapper(req);
        const result = await openai.getEmbeddings(req.body.params);
        res.json({ status: "OK", data: result });
    } catch (error) {
        res.json({ status: "ERROR", message: error.message });
    }
});

router.post('/images', async (req, res, next) => {
    try {
        const openai = getAPIWrapper(req);
        const result = await openai.generateImages(req.body.params);
        res.json({ status: "OK", data: result });
    } catch (error) {
        res.json({ status: "ERROR", message: error.message });
    }
});

router.post('/chat', async(req, res, next) => {
    try {
        const openai = getAPIWrapper(req);
        const isStream = req.body.params.stream || false;

        if (isStream) {
            const gptStreamParser = new GPTStreamParser();
            const stream = await openai.generateChatText(req.body.params);

            // set streaming headers
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            // collect the data from the stream
            for await (const chunk of stream) {
                const chunkText = chunk.toString('utf8');
                for await (const contentText of gptStreamParser.feed(chunkText)) {
                    res.write(`data: ${contentText}\n\n`); // write directly to the response
                }
            }

            // close the stream
            res.end();
        } else {
            const result = await openai.generateChatText(req.body.params);
            const responseChoices = result.choices;
            res.json({ status: "OK", data: { response: responseChoices } });
        }

    } catch (error) {
        res.json({ status: "ERROR", message: error.message });
    }
});

module.exports = router;