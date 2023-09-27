const express = require('express');
const multer = require('multer');

const pdf = require('pdf-parse');
const mammoth = require('mammoth');

const router = express.Router();
const upload = multer();

/**
 * @swagger
 * /parser/pdf_to_text:
 *   post:
 *     tags:
 *       - Parsers
 *     summary: Convert a PDF document to text with page-wise data.
 * 
 *     security:
 *       - ApiKeyAuth: []
 * 
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               pdf:
 *                 type: string
 *                 format: binary
 *                 description: PDF file to be converted.
 *     responses:
 *       200:
 *         description: Successfully converted PDF to text.
 *       400:
 *         description: Bad request or missing PDF file.
 *       500:
 *         description: Internal server error during PDF conversion.
 */
router.post('/pdf_to_text', upload.single('pdf'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: 'ERROR', message: 'PDF document not provided' });
    }
    try {
        const pages = []
        // reference copy of package code intelliserver\node_modules\pdf-parse\lib\pdf-parse.js
        function onPageRender(pageData) {
            const render_options = {
                //replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
                normalizeWhitespace: false,
                //do not attempt to combine same line TextItem's. The default value is `false`.
                disableCombineTextItems: false
            }

            return pageData.getTextContent(render_options)
                .then(function (textContent) {
                    let lastY, text = '';
                    for (let item of textContent.items) {
                        if (lastY == item.transform[5] || !lastY) {
                            text += item.str;
                        }
                        else {
                            text += '\n' + item.str;
                        }
                        lastY = item.transform[5];
                    }
                    pages.push(text)
                    return text;
                });
        }

        const { buffer } = req.file;
        await pdf(buffer, {
            pagerender: onPageRender
        })

        const response = {
            status: 'OK',
            data: {
                total_pages: pages.length,
                pages: pages.map((value, index) => {
                    return {
                        page_number: index + 1,
                        text: value
                    }
                }),
            },
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: error.message });
    }

});

/**
 * @swagger
 * /parser/word_to_text:
 *   post:
 *     tags:
 *       - Parsers
 *     summary: Convert a Word document to text.
 * 
 *     security:
 *       - ApiKeyAuth: []
 * 
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               doc:
 *                 type: string
 *                 format: binary
 *                 description: Word document to be converted.
 *     responses:
 *       200:
 *         description: Successfully converted Word to text.
 *       400:
 *         description: Bad request or missing Word document.
 *       500:
 *         description: Internal server error during Word conversion.
 */
router.post('/word_to_text', upload.single('doc'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: 'ERROR', message: 'Word document not provided' });
    }
    try {
        const { buffer } = req.file;
        const result = await mammoth.extractRawText({ buffer })
        const text = result.value;
        const paragraphs = text.split(/\n\n\n\n+/);
        const pages = paragraphs.filter(t => !!t).map((paragraph, index) => {
            return {
                paragraph_number: index + 1,
                value: paragraph.trim()
            }
        });

        const response = {
            status: 'OK',
            data: {
                total_pages: pages.length,
                pages
            },
        };
        res.json(response);
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: error.message });
    }
});

module.exports = router;
