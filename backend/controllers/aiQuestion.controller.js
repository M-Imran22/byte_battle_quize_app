const cheerio = require('cheerio');
const pdf = require('pdf-parse');
const axios = require('axios');
const db = require('../models');

// Local AI service URL
const AI_SERVICE_URL = 'http://localhost:5000';

// Direct MCQ extraction for common patterns
const extractMCQsFromURL = async (url) => {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const $ = cheerio.load(response.data);
        
        const mcqs = [];
        
        // Method 1: Look for any text containing questions and options
        const allText = $('body').text();
        const paragraphs = allText.split('\n').filter(p => p.trim().length > 10);
        
        for (let i = 0; i < paragraphs.length; i++) {
            const para = paragraphs[i].trim();
            
            // Find questions (must contain ? and be reasonable length)
            if (para.includes('?') && para.length > 20 && para.length < 200) {
                // Clean the question
                let question = para
                    .replace(/^\d+[\.\ ]/, '') // Remove question numbers
                    .replace(/Read More.*$/i, '') // Remove "Read More"
                    .replace(/Submitted by.*$/i, '') // Remove "Submitted by"
                    .trim();
                
                if (question.length < 20) continue;
                
                // Look for options in surrounding text
                const searchText = paragraphs.slice(Math.max(0, i-2), i+10).join(' ');
                const optionMatches = searchText.match(/[A-D][\.\ \)]\s*([^A-D\n]{2,60})/g) || [];
                
                const options = [];
                for (const match of optionMatches) {
                    const cleanOpt = match.replace(/^[A-D][\.\ \)]\s*/, '').trim();
                    if (cleanOpt.length > 1 && cleanOpt.length < 50 && 
                        !cleanOpt.toLowerCase().includes('read more') &&
                        !cleanOpt.toLowerCase().includes('submit')) {
                        options.push(cleanOpt);
                    }
                    if (options.length >= 4) break;
                }
                
                if (options.length >= 3) {
                    mcqs.push({ question, options: options.slice(0, 4) });
                    if (mcqs.length >= 10) break; // Limit extraction
                }
            }
        }
        
        // Method 2: If no MCQs found, try HTML elements
        if (mcqs.length === 0) {
            $('p, div, li, h1, h2, h3, h4, h5, h6').each((i, elem) => {
                const text = $(elem).text().trim();
                if (text.includes('?') && text.length > 20 && text.length < 200) {
                    const question = text.replace(/Read More.*$/i, '').replace(/Submitted by.*$/i, '').trim();
                    
                    // Look for options in next siblings
                    const options = [];
                    $(elem).nextAll().slice(0, 8).each((j, sibling) => {
                        const sibText = $(sibling).text().trim();
                        if (sibText.match(/^[A-D][\.\ \)]/) && sibText.length > 2 && sibText.length < 60) {
                            const cleanOpt = sibText.replace(/^[A-D][\.\ \)]+/, '').trim();
                            if (cleanOpt.length > 0) options.push(cleanOpt);
                        }
                    });
                    
                    if (options.length >= 3) {
                        mcqs.push({ question, options: options.slice(0, 4) });
                    }
                }
            });
        }
        
        console.log(`Extracted ${mcqs.length} MCQs from website`);
        return mcqs.slice(0, 8);
        
    } catch (error) {
        console.error('MCQ extraction failed:', error.message);
        return [];
    }
};

// Extract content from URL (fallback)
const extractFromURL = async (url) => {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        
        // Remove script, style, nav, footer elements
        $('script, style, nav, footer, header').remove();
        
        // Extract main content
        const content = $('main, article, .content, #content, .post, .article').text() || $('body').text();
        return content.replace(/\s+/g, ' ').trim().substring(0, 3000); // Limit to 3000 chars
    } catch (error) {
        throw new Error('Failed to extract content from URL');
    }
};

// Extract content from PDF buffer
const extractFromPDF = async (buffer) => {
    try {
        const data = await pdf(buffer);
        return data.text.replace(/\s+/g, ' ').trim().substring(0, 3000);
    } catch (error) {
        throw new Error('Failed to extract content from PDF');
    }
};

// Generate intelligent fallback questions
const generateIntelligentFallback = (content, count, questionType) => {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 30);
    const words = content.toLowerCase().split(/\s+/);
    const keyTerms = words.filter(w => w.length > 5).slice(0, 20);
    
    const questionTemplates = [
        { pattern: /([A-Z][a-z]+)\s+is\s+([^.]+)/, template: "What is {0}?", options: ["{1}", "Something else", "Not mentioned", "Unclear"] },
        { pattern: /([A-Z][a-z]+)\s+was\s+([^.]+)/, template: "What was {0}?", options: ["{1}", "Different", "Not stated", "Unknown"] },
        { pattern: /(\d+)\s+([a-z]+)/, template: "How many {1} are mentioned?", options: ["{0}", "More", "Less", "None"] },
        { pattern: /in\s+(\d{4})/, template: "When did this occur?", options: ["{0}", "Earlier", "Later", "Not specified"] }
    ];
    
    const questions = [];
    let questionIndex = 0;
    
    // Try pattern-based questions first
    for (const sentence of sentences.slice(0, count)) {
        for (const template of questionTemplates) {
            const match = sentence.match(template.pattern);
            if (match && questionIndex < count) {
                const question = template.template.replace(/{(\d+)}/g, (_, i) => match[parseInt(i) + 1]);
                const correctAnswer = template.options[0].replace(/{(\d+)}/g, (_, i) => match[parseInt(i) + 1]);
                
                questions.push({
                    question: question,
                    option_a: correctAnswer,
                    option_b: template.options[1],
                    option_c: template.options[2],
                    option_d: template.options[3],
                    correct_option: correctAnswer
                });
                questionIndex++;
                break;
            }
        }
    }
    
    // Fill remaining with key term questions
    while (questionIndex < count && keyTerms.length > 0) {
        const term = keyTerms[questionIndex % keyTerms.length];
        const contextSentence = sentences.find(s => s.toLowerCase().includes(term)) || sentences[0] || "";
        
        questions.push({
            question: `What does the content mention about "${term}"?`,
            option_a: `It is discussed in detail`,
            option_b: `It is briefly mentioned`,
            option_c: `It is not relevant`,
            option_d: `It needs clarification`,
            correct_option: contextSentence.length > 50 ? "It is discussed in detail" : "It is briefly mentioned"
        });
        questionIndex++;
    }
    
    return questions;
};

// Generate MCQs using local AI service
const generateMCQs = async (content, count, questionType, difficulty) => {
    try {
        console.log('Calling local AI service...');
        
        const response = await axios.post(`${AI_SERVICE_URL}/generate`, {
            content: content,
            count: count,
            question_type: questionType,
            difficulty: difficulty
        }, {
            timeout: 60000 // 60 second timeout for CPU processing
        });
        
        if (response.data.success) {
            console.log(`Generated ${response.data.questions.length} questions using local AI`);
            console.log('Sample AI question:', JSON.stringify(response.data.questions[0], null, 2));
            return response.data.questions;
        } else {
            throw new Error('AI service returned error');
        }
        
    } catch (error) {
        console.error('Local AI service failed:', error.message);
        
        // Fallback to intelligent content-based generation
        console.log('Using intelligent fallback question generation...');
        return generateIntelligentFallback(content, count, questionType);
    }
};

// Main controller function
exports.generateQuestionsFromContent = async (req, res) => {
    try {
        const { 
            contentType, // 'url', 'pdf', 'text'
            content, // URL string, text content, or will be in req.file for PDF
            questionCount = 5,
            questionType = 'General Knowledge',
            difficulty = 'Medium'
        } = req.body;

        let extractedContent = '';

        // Extract content based on type
        let foundMCQs = [];
        switch (contentType) {
            case 'url':
                // First try to extract existing MCQs
                foundMCQs = await extractMCQsFromURL(content);
                console.log(`Found ${foundMCQs.length} existing MCQs on webpage`);
                
                if (foundMCQs.length > 0) {
                    // Extract both questions and options for better context
                    const questions = foundMCQs.map(mcq => mcq.question);
                    const allOptions = foundMCQs.flatMap(mcq => mcq.options);
                    
                    const cleanOptions = allOptions.filter(opt => 
                        opt.length > 1 && 
                        opt.length < 40 &&
                        !opt.toLowerCase().includes('submit') &&
                        !opt.toLowerCase().includes('quiz') &&
                        !opt.toLowerCase().includes('read')
                    );
                    
                    extractedContent = `MCQS_FOUND: Questions: ${questions.join(' | ')} Options: ${cleanOptions.join(' | ')}`;
                    console.log(`Using ${foundMCQs.length} MCQs with ${cleanOptions.length} options`);
                } else {
                    // Fallback to regular content extraction
                    extractedContent = await extractFromURL(content);
                }
                break;
            case 'pdf':
                if (!req.file) {
                    return res.status(400).json({ error: 'PDF file is required' });
                }
                extractedContent = await extractFromPDF(req.file.buffer);
                break;
            case 'text':
                extractedContent = content.substring(0, 3000);
                break;
            default:
                return res.status(400).json({ error: 'Invalid content type' });
        }

        if (!extractedContent.trim()) {
            return res.status(400).json({ error: 'No content could be extracted' });
        }

        // Generate MCQs using AI
        const questions = await generateMCQs(
            extractedContent, 
            parseInt(questionCount), 
            questionType, 
            difficulty
        );
        
        // Filter out potential duplicates
        const user_id = req.user.id;
        const uniqueQuestions = [];
        const existingQuestions = await db.Question.findAll({
            attributes: ['question'],
            where: { q_type: questionType.toLowerCase(), user_id }
        });
        
        const existingTexts = existingQuestions.map(q => q.question.toLowerCase());
        
        for (const q of questions) {
            const questionLower = q.question.toLowerCase();
            const isDuplicate = existingTexts.some(existing => 
                existing.includes(questionLower.substring(0, 30)) || 
                questionLower.includes(existing.substring(0, 30))
            );
            
            if (!isDuplicate) {
                uniqueQuestions.push(q);
                existingTexts.push(questionLower); // Add to prevent duplicates within this batch
            }
        }

        // Save unique questions to database
        const savedQuestions = [];
        for (const q of uniqueQuestions) {
            try {
                const savedQuestion = await db.Question.create({
                    q_type: questionType.toLowerCase(),
                    question: q.question,
                    option_a: q.option_a,
                    option_b: q.option_b,
                    option_c: q.option_c,
                    option_d: q.option_d,
                    correct_option: q.correct_option,
                    user_id
                });
                savedQuestions.push(savedQuestion);
            } catch (error) {
                if (error.name === 'SequelizeUniqueConstraintError') {
                    // Skip duplicate questions
                    console.log('Skipping duplicate question:', q.question.substring(0, 50));
                    continue;
                } else {
                    throw error;
                }
            }
        }

        res.status(201).json({
            message: `${savedQuestions.length} questions generated and saved successfully!`,
            questions: savedQuestions,
            extractedContent: extractedContent.substring(0, 200) + '...'
        });

    } catch (error) {
        console.error('AI Question Generation Error:', error);
        res.status(500).json({ 
            error: 'Failed to generate questions',
            details: error.message 
        });
    }
};