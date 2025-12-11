const db = require("../models");



exports.getAllQuestions = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { count, rows: questions } = await db.Question.findAndCountAll({
      where: { user_id }
    });
    res.status(200).json({ count, questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Failed to fetch all questions from the database." });
  }
};

exports.getAllQuestionType = async (req, res) => {
  try {
    const user_id = req.user.id;
    // SELECT DISTINCT q_type FROM questions WHERE user_id = ?
    const questionTypes = await db.Question.findAll({
      where: { user_id },
      attributes: [
        [db.sequelize.fn('DISTINCT', db.sequelize.col('q_type')),
          'question_type']
      ],
      raw: true,
    });
    res.status(200).json(questionTypes);
  } catch (error) {
    console.error("Error fetching question types:", error);
    res.status(500).json({ error: "Failed to fetch question types" });
  }
}

exports.destroyQuestion = async (req, res) => {
  const { id } = req.params;

  try {
    const question = await db.Question.findByPk(id);

    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    // Delete the question from the database
    await question.destroy();

    res.status(200).json({ message: "Question deleted successfully." });
  } catch (error) {
    console.error("Error during question deletion:", error);
    res.status(500).json({ error: "Failed to delete question." });
  }
};

exports.editQuestion = async (req, res) => {

  const questionId = req.params.id;

  try {

    const question = await db.Question.findByPk(questionId)

    if (!question) {
      return res.status(404).json({ error: "Question not found" })
    } else {
      res.status(200).json({ question })
    }

  } catch (error) {
    console.error("Failed to fetch question from DB.")

    res.status(500).json({ error: "Failed to fetch question." })
  }

}

exports.updateQuestion = async (req, res) => {
  const questionId = req.params.id;
  const { q_type, question, option_a, option_b, option_c, option_d, correct_option } = req.body;

  const transaction = await db.sequelize.transaction()

  try {
    const questionInDB = await db.Question.findByPk(questionId)

    if (!questionInDB) {
      return res.status(404).json({ error: "Question not found" })
    }

    const updatedFields = {
      q_type: q_type || questionInDB.q_type,
      question: question || questionInDB.question,
      option_a: option_a || questionInDB.option_a,
      option_b: option_b || questionInDB.option_b,
      option_c: option_c || questionInDB.option_c,
      option_d: option_d || questionInDB.option_d,
      correct_option: correct_option || questionInDB.correct_option
    }

    await db.Question.update(updatedFields, {
      where: { id: questionId },
      transaction,
    });

    await transaction.commit();

    console.log("Question update successfuly.", questionInDB)

    res.status(200).json({ message: "Question update successfuly.", questionInDB })

  } catch (error) {
    console.error(`Failed to update question with id ${questionId}:`, error);
    await transaction.rollback();
    res.status(500).json({ error: "Failed to update question" });
  }
}