// replicate.js
const express = require('express');
var path = require('path');
const router = express.Router();

const { ReplicateWrapper } = require('intellinode');
const { USE_DEFAULT_KEYS } = require(path.join(global.__basedir, 'config'));

function getAPIWrapper(req) {
  if (USE_DEFAULT_KEYS && !req.body.api_key) {
    return new ReplicateWrapper(process.env.REPLICATE_API_KEY);
  } else {
    return new ReplicateWrapper(req.body.api_key);
  }
}

/**
 * @swagger
 * /replicate/predict:
 *   post:
 *     tags:
 *       - Models
 *     summary: Predicts the output based on the input data using Replicate's AI model.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - api_key
 *               - params
 *             properties:
 *               api_key:
 *                 type: string
 *                 description: The api key for Replicate.
 *               params:
 *                 type: object
 *                 properties:
 *                   model_tag:
 *                     type: string
 *                     description: The model tag to be used for prediction.
 *                   input_data:
 *                     type: object
 *                     properties:
 *                       version:
 *                         type: string
 *                         description: Version string.
 *                       input:
 *                         type: object
 *                         properties:
 *                           prompt:
 *                             type: string
 *                             description: The prompt for the AI model.
 *                           max_new_tokens:
 *                             type: integer
 *                             description: The maximum number of new tokens to be generated.
 *                           temperature:
 *                             type: float
 *                             description: The randomness factor.
 *                           debug:
 *                             type: boolean
 *                             description: Whether to perform debug or not.
 *     responses:
 *       200:
 *         description: The prediction result from Replicate.
 *       400:
 *         description: There was a problem with the request.
 */
router.post('/predict', async (req, res, next) => {
  try {
    const replicate = getAPIWrapper(req);
    const result = await replicate.predict(req.body.params.model_tag, req.body.params.input_data);
    res.json({ status: "OK", data: result });
  } catch (error) {
    res.json({ status: "ERROR", message: error.message });
  }
});

/**
 * @swagger
 * /replicate/status:
 *   post:
 *     tags:
 *       - Models
 *     summary: Checks the status of a prediction using Replicate.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - api_key
 *               - params
 *             properties:
 *               api_key:
 *                 type: string
 *                 description: The api key for Replicate.
 *               params:
 *                 type: object
 *                 properties:
 *                   prediction_id:
 *                     type: string
 *                     description: The ID of the prediction.
 *     responses:
 *       200:
 *         description: The status of the prediction.
 *       400:
 *         description: There was a problem with the request.
 */
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