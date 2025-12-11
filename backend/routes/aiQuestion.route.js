const express = require('express');
const multer = require('multer');
const { importQuestionsFromExcel, downloadExcelTemplate } = require('../controllers/aiQuestion.controller');

const router = express.Router();

// Configure multer for Excel uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel' // .xls
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files (.xlsx, .xls) are allowed'), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Import questions from Excel
router.post('/import-excel', upload.single('excelFile'), importQuestionsFromExcel);

// Download Excel template
router.get('/excel-template', downloadExcelTemplate);

module.exports = router;