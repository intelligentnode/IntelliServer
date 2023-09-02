var express = require('express');
var path = require('path');
var router = express.Router();

const { HuggingWrapper } = require('intellinode');
const { USE_DEFAULT_KEYS } = require(path.join(global.__basedir, 'config'));

function getAPIWrapper(req) {
  if (USE_DEFAULT_KEYS) {
    return new HuggingWrapper(process.env.HUGGING_API_KEY);
  } else {
    return new HuggingWrapper(req.body.api_key);
  }
}

router.post('/text', async (req, res, next) => {
  try {
    const hugging = getAPIWrapper(req);
    const result = await hugging.generateText(req.body.params.model_id, req.body.params.data);
    res.json({ status: "OK", data: result });
  } catch (error) {
    res.json({ status: "ERROR", message: error.message });
  }
});

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