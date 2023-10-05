const express = require('express');
const multer = require('multer');

const AWS = require('aws-sdk');
const { ImageAnnotatorClient } = require('@google-cloud/vision');

const router = express.Router();
const upload = multer();

router.post('/aws', upload.single('image'), async (req, res) => {
    const { buffer } = req.file;
    try {
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

router.post('/google', upload.single('image'), async (req, res) => {
    const { buffer } = req.file;
    try {
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