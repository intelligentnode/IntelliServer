const express = require('express');
const AWS = require('aws-sdk');
const path = require('path');
const fetch = require('node-fetch'); // For making HTTP requests
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const getImageFromUrlOrFile = require('../../middleware/getImageFromUrlOrFile');
const awsConfigProvider = require('../../middleware/awsConfigProvider');
const { USE_DEFAULT_KEYS } = require(path.join(global.__basedir, 'config'));

const router = express.Router();


function getGoogleKey(req) {
  if (USE_DEFAULT_KEYS && !req.body.api_key) {
    return process.env.GOOGLE_KEY;
  } else {
    return req.body.api_key;
  }
}

/**
 * @swagger
 * /ocr/aws:
 *   post:
 *     summary: Perform OCR on an image using AWS Rekognition.
 *     tags:
 *       - OCR
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: The URL of the image to perform OCR on.
 *     responses:
 *       200:
 *         description: OCR results.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: The status of the OCR operation (e.g., "OK").
 *                 data:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: array
 *                       items: 
 *                          type: string
 *                       description: The extracted text from the image.
 *       400:
 *         description: Invalid request or image URL.
 *       500:
 *         description: Internal server error.\
 *     parameters:
 *       - in: header
 *         name: X-aws-access-Key
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional AWS access key for this specific request.
 *       - in: header
 *         name: X-aws-secret-Key
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional AWS secret key for this specific request.
 *       - in: header
 *         name: X-aws-region
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional AWS region for this specific request.
 */
router.post('/aws', awsConfigProvider, getImageFromUrlOrFile, async (req, res) => {
    try {
        const { buffer } = req.file;
        const awsOcr = async (imageBuffer) => {
            const rekognition = new AWS.Rekognition({
                accessKeyId: req.awsConfig.accessKeyId,
                secretAccessKey: req.awsConfig.secretAccessKey,
                region : req.awsConfig.region
            });

            const params = {
                Image: {
                    Bytes: imageBuffer,
                },
            };

            const response = await rekognition.detectText(params).promise();
            const detectedText = response.TextDetections.map((textDetection) => textDetection.DetectedText);
            return detectedText;
        }

        const detectedText = await awsOcr(buffer);
        const response = {
            status: 'OK',
            data: {
                text: detectedText
            },
        };
        res.json(response);
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: error.message });
    }
});

/**
 * @swagger
 * /ocr/google:
 *   post:
 *     summary: Perform OCR on an image using Google Cloud Vision API.
 *     tags:
 *       - OCR
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: The URL of the image to perform OCR on.
 *               apiKey:
 *                 type: string
 *                 required: false
 *                 description: Optional API key for this specific request.
 *     responses:
 *       200:
 *         description: OCR results.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: The status of the OCR operation (e.g., "OK").
 *                 data:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                       description: The extracted text from the image.
 *       400:
 *         description: Invalid request or image URL.
 *       500:
 *         description: Internal server error.
 *     parameters:
 *       - in: header
 *         name: X-aws-access-Key
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional AWS access key for this specific request.
 *       - in: header
 *         name: X-aws-secret-Key
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional AWS secret key for this specific request.
 *       - in: header
 *         name: X-aws-region
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional AWS region for this specific request.
 */
router.post('/google', getImageFromUrlOrFile, async (req, res) => {
    try {
        const { buffer } = req.file;
        const apiKey = getGoogleKey(req);

        const googleOcr = async (imageBuffer) => {
            const client = new ImageAnnotatorClient();
            const [result] = await client.textDetection(imageBuffer);
            const detectedText = result.textAnnotations.map((annotation) => annotation.description);
            return detectedText;
        };
        const fetchOcr = async (imageBuffer) => {
            // Define the Vision API endpoint
            const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
            // Prepare the request data
            const requestData = {
                requests: [
                    {
                        image: {
                            content: buffer.toString('base64'),
                        },
                        features: [{ type: 'TEXT_DETECTION' }],
                    },
                ],
            };
            // Make a POST request to the Vision API using node-fetch
            const response = await fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify(requestData),
                headers: { 'Content-Type': 'application/json' },
            });

            // Check the response status
            if (response.status !== 200) {
                throw new Error(`Vision API request failed with status code ${response.status}`);
            }

            // Parse the JSON response
            const responseData = await response.json();

            // Extract detected text from the response
            const detectedText = responseData.responses[0].textAnnotations.map(annotation => annotation.description);

            return detectedText;
        };

        let detectedText
        if(apiKey) {
            detectedText = await fetchOcr(buffer)
        } else {
            detectedText = await googleOcr(buffer)
        }

        const responseBody = {
            status: 'OK',
            data: {
                text: detectedText,
            },
        };

        res.json(responseBody);
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: error.message });
    }
});

module.exports = router;