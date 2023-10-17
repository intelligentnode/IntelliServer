const express = require('express');
const AWS = require('aws-sdk');

const { ImageAnnotatorClient } = require('@google-cloud/vision');

const getImageFromUrlOrFile = require('../../middleware/getImageFromUrlOrFile');
const config = require('../../config');

const router = express.Router();

// Set up AWS SDK configuration
AWS.config.update({
    accessKeyId: config.AWS_ACCESS_KEY,
    secretAccessKey: config.AWS_ACCESS_SECRET,
    region: config.AWS_DEFAULT_REGION
});


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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image to be used for OCR (upload a file).
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
 *         description: Invalid request or image format.
 *       500:
 *         description: Internal server error.
 */
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
 *                       type: string
 *                       description: The extracted text from the image.
 *       400:
 *         description: Invalid request or image URL.
 *       500:
 *         description: Internal server error.
 */
router.post('/aws', getImageFromUrlOrFile, async (req, res) => {
    try {
        const { buffer } = req.file;
        const awsOcr = async (imageBuffer) => {
            const rekognition = new AWS.Rekognition();

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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image to be used for OCR (upload a file).
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
 *         description: Invalid request or image format.
 *       500:
 *         description: Internal server error.
 */

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
 */

router.post('/google', getImageFromUrlOrFile, async (req, res) => {
    try {
        const { buffer } = req.file;
        const googleOcr = async (imageBuffer) => {
            const client = new ImageAnnotatorClient();
            const [result] = await client.textDetection(imageBuffer);
            const detectedText = result.textAnnotations.map((annotation) => annotation.description);
            return detectedText;
        };

        const detectedText = await googleOcr(buffer);
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

module.exports = router;