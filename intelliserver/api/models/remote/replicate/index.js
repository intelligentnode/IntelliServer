// replicate.js
const express = require('express');
var path = require('path');
const router = express.Router();

const { ReplicateWrapper } = require('intellinode');
const { USE_DEFAULT_KEYS } = require(path.join(global.__basedir, 'config'));

function getAPIWrapper(req) {
  if (USE_DEFAULT_KEYS) {
    return new ReplicateWrapper(process.env.REPLICATE_API_KEY);
  } else {
    return new ReplicateWrapper(req.body.api_key);
  }
}

router.post('/predict', async (req, res, next) => {
  try {
    const replicate = getAPIWrapper(req);
    const result = await replicate.predict(req.body.params.model_tag, req.body.params.input_data);
    res.json({ status: "OK", data: result });
  } catch (error) {
    res.json({ status: "ERROR", message: error.message });
  }
});

router.post('/status', async (req, res, next) => {
    try {
        const replicate = getAPIWrapper(req);
        const result = await replicate.getPredictionStatus(req.body.params.prediction_id);
        res.json({ status: "OK", data: result });
    } catch (error) {
        res.json({ status: "ERROR", message: error.message });
    }
});

module.exports = router;