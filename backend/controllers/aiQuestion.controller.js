const XLSX = require('xlsx');
const db = require('../models');

// Process Excel file and extract questions
const processExcelFile = (buffer) => {
    try {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Skip header row and filter empty rows
        const dataRows = rows.slice(1).filter(row => row.length >= 7 && row[1]);
        
        const questions = [];
        const errors = [];
        
        dataRows.forEach((row, index) => {
            const rowNum = index + 2; // +2 because we skipped header and arrays are 0-indexed
            
            // Validate row data
            if (!row[0] || !row[1] || !row[2] || !row[3] || !row[4] || !row[5] || !row[6]) {
                errors.push(`Row ${rowNum}: Missing required fields`);
                return;
            }
            
            const correctOptionLetter = row[6].toString().toUpperCase();
            if (!['A', 'B', 'C', 'D'].includes(correctOptionLetter)) {
                errors.push(`Row ${rowNum}: Correct option must be A, B, C, or D`);
                return;
            }
            
            const correctOptionValue = correctOptionLetter === 'A' ? row[2] :
                                     correctOptionLetter === 'B' ? row[3] :
                                     correctOptionLetter === 'C' ? row[4] : row[5];
            
            questions.push({
                q_type: row[0].toString().toLowerCase().trim(),
                question: row[1].toString().trim(),
                option_a: row[2].toString().trim(),
                option_b: row[3].toString().trim(),
                option_c: row[4].toString().trim(),
                option_d: row[5].toString().trim(),
                correct_option: correctOptionValue.toString().trim()
            });
        });
        
        return { questions, errors };
    } catch (error) {
        throw new Error('Failed to process Excel file: ' + error.message);
    }
};

// Import questions from Excel file
exports.importQuestionsFromExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Excel file is required' });
        }

        const user_id = req.user.id;
        const { questions, errors } = processExcelFile(req.file.buffer);
        
        if (errors.length > 0) {
            return res.status(400).json({ 
                error: 'Excel file contains errors',
                details: errors
            });
        }

        if (questions.length === 0) {
            return res.status(400).json({ error: 'No valid questions found in Excel file' });
        }

        // Check for duplicates
        const existingQuestions = await db.Question.findAll({
            where: { user_id },
            attributes: ['question']
        });
        
        const existingTexts = existingQuestions.map(q => q.question.toLowerCase().trim());
        
        const newQuestions = [];
        const duplicates = [];
        
        questions.forEach((q, index) => {
            const questionText = q.question.toLowerCase().trim();
            if (existingTexts.includes(questionText)) {
                duplicates.push(`Row ${index + 2}: "${q.question}" already exists`);
            } else {
                newQuestions.push({ ...q, user_id });
                existingTexts.push(questionText); // Prevent duplicates within same file
            }
        });
        
        if (newQuestions.length === 0) {
            return res.status(400).json({
                error: 'All questions already exist in database',
                details: duplicates
            });
        }

        // Save only new questions to database
        const savedQuestions = await db.Question.bulkCreate(newQuestions);
        
        const response = {
            message: `${savedQuestions.length} questions imported successfully!`,
            count: savedQuestions.length,
            questions: savedQuestions
        };
        
        if (duplicates.length > 0) {
            response.message += ` (${duplicates.length} duplicates skipped)`;
            response.duplicates = duplicates;
        }
        
        return res.status(201).json(response);

    } catch (error) {
        console.error('Excel Import Error:', error);
        res.status(500).json({ 
            error: 'Failed to import questions from Excel',
            details: error.message 
        });
    }
};

// Generate Excel template for download
exports.downloadExcelTemplate = (req, res) => {
    try {
        const templateData = [
            ['Question Type', 'Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Option'],
            ['Science', 'What is H2O?', 'Hydrogen', 'Water', 'Oxygen', 'Carbon', 'B'],
            ['Math', 'What is 2+2?', '3', '4', '5', '6', 'B'],
            ['History', 'Who was the first US President?', 'Washington', 'Lincoln', 'Jefferson', 'Adams', 'A']
        ];
        
        const worksheet = XLSX.utils.aoa_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');
        
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Disposition', 'attachment; filename=question_template.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
        
    } catch (error) {
        console.error('Template Generation Error:', error);
        res.status(500).json({ 
            error: 'Failed to generate template',
            details: error.message 
        });
    }
};