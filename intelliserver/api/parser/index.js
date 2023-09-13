const express = require('express');
const multer = require('multer');

const pdf = require('pdf-parse');
const mammoth = require('mammoth');

const router = express.Router();
const upload = multer();

router.post('/pdf_to_text', upload.single('pdf'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'PDF document not provided' });
    }
    const { buffer } = req.file;

    pdf(buffer)
        .then(data => {
            const text = data.text;
            // You can further process the 'text' variable as needed
            res.json({ text });
        })
        .catch(error => {
            res.status(500).json({ error: 'Error parsing PDF', message: error.message });
        });
});

router.post('/word_to_text', upload.single('doc'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Word document not provided' });
    }
    const { buffer } = req.file;

    mammoth.extractRawText({ buffer })
        .then(result => {
            const text = result.value;
            // You can further process the 'text' variable as needed
            res.json({ text });
        })
        .catch(error => {
            res.status(500).json({ error: 'Error parsing Word document', message: error.message });
        });
});

module.exports = router;
