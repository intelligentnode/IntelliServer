const multer = require('multer');
const fetch = require('node-fetch'); // For making HTTP requests

// Configure multer for file uploads
const upload = multer();

// Middleware function to fetch and add image buffer to req.file
const getImageFromUrlOrFile = async (req, res, next) => {
    try {
        // Check if 'imageUrl' is present in the request body
        const imageUrl = req.body.imageUrl;

        if (imageUrl) {
            // Fetch the image using the provided URL
            const response = await fetch(imageUrl);

            if (!response.ok) {
                throw new Error('Failed to fetch the image');
            }

            const imageBuffer = await response.buffer();

            // Add the image buffer to req.file
            req.file = { fieldname: 'image', originalname: 'image', buffer: imageBuffer };
        }
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: error.message });
    }

    // Continue to the file upload middleware (upload.single('image'))
    upload.single('image')(req, res, next);
};

module.exports = getImageFromUrlOrFile;
