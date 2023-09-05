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