const express = require('express');
const os = require('os');
const path = require('path');
const fs = require('fs');
const multer  = require('multer');
const upload = multer();

const { StabilityAIWrapper } = require('intellinode');
const { USE_DEFAULT_KEYS } = require(path.join(global.__basedir, 'config'));

const router = express.Router();

function getAPIWrapper(req) {

    if (USE_DEFAULT_KEYS && !req.body.api_key) {
        return new StabilityAIWrapper(process.env.STABILITY_API_KEY);
    } else {
        return new StabilityAIWrapper(req.body.api_key);
    }
}

/**
 * @swagger
 * /stability/images:
 *   post:
 *     tags:
 *       - Models
 *     summary: Generates image from text prompts using Stable Diffusion.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - params
 *             properties:
 *               params:
 *                 type: object
 *                 properties:
 *                   text_prompts:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         text:
 *                           type: string
 *                           description: The text to visualize as an image.
 *                         weight:
 *                           type: float
 *                           description: The weight of the prompt.
 *                   cfg_scale:
 *                     type: integer
 *                     description: The configuration scale for the model.
 *                   steps:
 *                     type: integer
 *                     description: The number of steps to take in generating the image.
 *     responses:
 *       200:
 *         description: The generated image from Stability.
 *       400:
 *         description: There was a problem with the request.
 */
router.post('/images', upload.none(), async (req, res) => {
    try {
        const stability = getAPIWrapper(req);

        const result = await stability.generateTextToImage(req.body.params);

        res.json({ status: 'OK', data: result });
    }
    catch (error) {
        res.json({ status: 'ERROR', message: error.message });
    }
});

/**
 * @swagger
 * /stability/image_to_image:
 *   post:
 *     tags:
 *       - Models
 *     summary: Generates an image from another image using Stable Diffusion.
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
 *                 description: The file to upload.
 *               params:
 *                 type: string
 *                 description: The JSON serialized parameters for the image generation.
 *     responses:
 *       200:
 *         description: The generated image from Stability.
 *       400:
 *         description: There was a problem with the request.
 */
router.post('/image_to_image', upload.single('image'), async (req, res) => {
    try {
        const stability = getAPIWrapper(req);
        const { buffer, originalname } = req.file;

        // write file to a temporary path
        const tempPath = path.join(os.tmpdir(), originalname);
        fs.writeFileSync(tempPath, buffer);

        const params = {
            ...JSON.parse(req.body.params),
            imagePath: tempPath
        };

        const result = await stability.generateImageToImage(params);

        // remove temporary file
        fs.unlinkSync(tempPath);

        res.json({ status: 'OK', data: result });
    }
    catch (error) {
        res.json({ status: 'ERROR', message: error.message });
    }
});

module.exports = router;