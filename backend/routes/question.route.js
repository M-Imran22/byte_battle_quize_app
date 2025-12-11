const express = require('express')
const router = express.Router()
const QuestionController = require("../controllers/question.controller")


router.get('/all_questions', QuestionController.getAllQuestions)
router.get('/all_question_types', QuestionController.getAllQuestionType)
router.delete('/:id', QuestionController.destroyQuestion)
router.get('/:id/edit', QuestionController.editQuestion)
router.put('/:id', QuestionController.updateQuestion)


module.exports = router