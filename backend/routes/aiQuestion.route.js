const express = require('express');
const multer = require('multer');
const { generateQuestionsFromContent } = require('../controllers/aiQuestion.controller');

const router = express.Router();

// Configure multer for PDF uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Generate questions from content
router.post('/generate', upload.single('pdfFile'), generateQuestionsFromContent);

module.exports = router;