const { where } = require("sequelize");
const db = require("../models");

exports.createMatch = async (req, res) => {
    const { match_name, match_type, team_ids, question_count } = req.body;
    const user_id = req.user.id;

    // Validate input data
    if (!match_name || !match_type || !Array.isArray(team_ids) || team_ids.length === 0 || !question_count) {
        return res.status(400).json({ error: "Invalid input data. Ensure all fields are provided." });
    }

    try {
        // Check if the teams exist and belong to the user
        const existingTeams = await db.Team.findAll({ where: { id: team_ids, user_id } });

        // If some teams don't exist or don't belong to user, return error
        if (existingTeams.length !== team_ids.length) {
            return res.status(400).json({ error: "Some teams do not exist or don't belong to you." });
        }

        // Check if user has enough questions of the specified type
        const whereClause = { user_id };
        if (match_type && match_type !== 'All Types') {
            whereClause.q_type = match_type;
        }
        
        const availableQuestions = await db.Question.findAll({ where: whereClause });
        if (availableQuestions.length < question_count) {
            return res.status(400).json({ error: `Not enough ${match_type} questions. You have ${availableQuestions.length} questions but need ${question_count}.` });
        }

        // Create a new match record
        const newMatch = await db.Match.create({ 
            match_name, 
            match_type, 
            question_count,
            user_id 
        });

        // Randomly select questions for this match
        const shuffledQuestions = availableQuestions.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffledQuestions.slice(0, question_count);

        // Create Match_Question entries
        const matchQuestionEntries = selectedQuestions.map((question, index) => ({
            match_id: newMatch.id,
            question_id: question.id,
            question_order: index + 1
        }));
        await db.Match_Question.bulkCreate(matchQuestionEntries);

        // Create entries in the Team_Match table for each team participating in the match
        const teamMatchEntries = team_ids.map((team_id) => ({
            team_id,
            match_id: newMatch.id,
            score: 0,
        }));

        // Insert the Team_Match entries in bulk
        await db.Team_Match.bulkCreate(teamMatchEntries);

        // Return success response with the created match data
        return res.status(201).json({ message: "Match added successfully.", match: newMatch });
    } catch (error) {
        console.error("Error occurred during match creation:", error);
        return res.status(500).json({ error: "An error occurred while adding the match." });
    }
};


exports.updateScore = async (req, res) => {
    const { rounds } = req.body;

    if (!Array.isArray(rounds)) {
        return res.status(400).json({ error: "Invalid input data. Ensure rounds is an array." });
    }

    for (const round of rounds) {
        if (!round.team_id || !round.match_id || round.score === undefined) {
            return res.status(400).json({ error: "Invalid input data. Each item must contain team_id, match_id, and score." });
        }
    }

    // Check if any match is completed
    const matchIds = [...new Set(rounds.map(round => round.match_id))];
    const matches = await db.Match.findAll({ where: { id: matchIds } });
    const completedMatch = matches.find(match => match.status === 'completed');
    
    if (completedMatch) {
        return res.status(400).json({ error: "Cannot update scores for completed matches." });
    }

    const transaction = await db.sequelize.transaction(); // Start a transaction

    try {
        for (const round of rounds) {
            await db.Team_Match.update(
                { score: round.score },
                {
                    where: {
                        team_id: round.team_id,
                        match_id: round.match_id,
                    },
                    transaction, // Pass the transaction object
                }
            );
        }

        await transaction.commit(); // Commit the transaction
        res.status(200).json({ message: "Scores updated successfully." });
    } catch (error) {
        await transaction.rollback(); // Rollback the transaction on error
        console.error("Error updating scores:", error);
        res.status(500).json({ error: "Failed to update scores.", details: error.message });
    }
};

exports.getAllMatches = async (req, res) => {
    try {
        const user_id = req.user.id;
        // Fetch all matches along with associated teams and their scores
        const { count, rows: matches } = await db.Match.findAndCountAll({
            where: { user_id },
            attributes: ['id', 'match_name', 'match_type', 'question_count', 'status', 'createdAt', 'updatedAt'],
            include: [
                {
                    model: db.Team_Match,
                    as: "rounds",
                    include: [
                        {
                            model: db.Team,
                            as: "teams",
                        },
                    ],
                },
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ count, matches });
    } catch (error) {
        console.error("Error fetching matches:", error);
        res.status(500).json({ error: "Failed to fetch matches" });
    }
};



exports.destroyMatch = async (req, res) => {
    const matchId = req.params.id;

    try {
        const match = await db.Match.findByPk(matchId);

        if (!match) {
            return res.status(404).json({ error: "Match not found." });
        }

        await db.Team_Match.destroy({
            where: { match_id: matchId },
        });

        await match.destroy();

        return res.status(200).json({ message: "Match deleted successfully." });
    } catch (error) {
        console.error(`Failed to delete match with id ${matchId}:`, error);
        return res.status(500).json({ error: "Failed to delete match." });
    }
}

exports.editMatch = async (req, res) => {
    const matchId = req.params.id;

    try {
        const match = await db.Match.findByPk(matchId, {
            include: {
                model: db.Team_Match,
                as: "rounds",
                include: {
                    model: db.Team,
                    as: "teams",
                },
            },
        });

        if (!match) {
            return res.status(404).json({ error: "Match not found." });
        }

        res.status(200).json({ match });
    } catch (error) {
        console.error(`Failed to retrieve match with id ${matchId}:`, error);
        res.status(500).json({ error: "Failed to retrieve match." });
    }
};


exports.updateMatch = async (req, res) => {
    const matchId = req.params.id;
    const { match_name, match_type, team_ids } = req.body;

    try {
        const match = await db.Match.findByPk(matchId);

        if (!match) {
            return res.status(404).json({ error: "Match not found." });
        }

        if (match_name || match_type) {
            await match.update({ match_name, match_type });
        }

        if (team_ids && Array.isArray(team_ids)) {
            const existingTeams = await db.Team.findAll({ where: { id: team_ids } });
            if (existingTeams.length !== team_ids.length) {
                return res.status(400).json({ error: "Some teams do not exist in the database." });
            }

            await db.Team_Match.destroy({ where: { match_id: matchId } });

            const teamMatchEntries = team_ids.map((team_id) => ({
                team_id,
                match_id: matchId,
                score: 0,
            }));
            await db.Team_Match.bulkCreate(teamMatchEntries);
        }

        res.status(200).json({ message: "Match updated successfully." });
    } catch (error) {
        console.error(`Failed to update match with id ${matchId}:`, error);
        res.status(500).json({ error: "Failed to update match." });
    }
};

exports.startMatch = async (req, res) => {
    const matchId = req.params.id;
    const user_id = req.user.id;

    try {
        const match = await db.Match.findOne({ where: { id: matchId, user_id } });
        if (!match) {
            return res.status(404).json({ error: "Match not found." });
        }

        await match.update({ status: 'active' });
        res.status(200).json({ message: "Match started successfully.", match });
    } catch (error) {
        console.error("Error starting match:", error);
        res.status(500).json({ error: "Failed to start match." });
    }
};

exports.getCurrentQuestion = async (req, res) => {
    const matchId = req.params.id;
    const user_id = req.user.id;

    try {
        const match = await db.Match.findOne({ where: { id: matchId, user_id } });
        if (!match) {
            return res.status(404).json({ error: "Match not found." });
        }

        const currentQuestion = await db.Match_Question.findOne({
            where: { match_id: matchId, question_order: match.current_question_index + 1 },
            include: [{
                model: db.Question,
                as: "question"
            }]
        });

        if (!currentQuestion) {
            return res.status(200).json({ 
                message: "No more questions", 
                question: null,
                isComplete: true,
                progress: { current: match.current_question_index, total: match.question_count }
            });
        }

        res.status(200).json({ 
            question: currentQuestion.question,
            isComplete: false,
            progress: { current: match.current_question_index + 1, total: match.question_count }
        });
    } catch (error) {
        console.error("Error getting current question:", error);
        res.status(500).json({ error: "Failed to get current question." });
    }
};

exports.nextQuestion = async (req, res) => {
    const matchId = req.params.id;
    const user_id = req.user.id;

    try {
        const match = await db.Match.findOne({ where: { id: matchId, user_id } });
        if (!match) {
            return res.status(404).json({ error: "Match not found." });
        }

        // Get current question to delete
        const currentQuestion = await db.Match_Question.findOne({
            where: { match_id: matchId, question_order: match.current_question_index + 1 },
            include: [{
                model: db.Question,
                as: "question"
            }]
        });

        if (currentQuestion) {
            // Delete the question permanently from Questions table
            await db.Question.destroy({ where: { id: currentQuestion.question_id } });
            
            // Remove from Match_Question table
            await db.Match_Question.destroy({ where: { id: currentQuestion.id } });
        }

        // Update match progress
        const newIndex = match.current_question_index + 1;
        await match.update({ current_question_index: newIndex });

        // Check if match is complete
        if (newIndex >= match.question_count) {
            await match.update({ status: 'completed' });
            return res.status(200).json({ 
                message: "Match completed", 
                isComplete: true,
                progress: { current: newIndex, total: match.question_count }
            });
        }

        res.status(200).json({ 
            message: "Question deleted and moved to next", 
            isComplete: false,
            progress: { current: newIndex, total: match.question_count }
        });
    } catch (error) {
        console.error("Error moving to next question:", error);
        res.status(500).json({ error: "Failed to move to next question." });
    }
};

exports.getWinner = async (req, res) => {
    const matchId = req.params.id;
    const user_id = req.user.id;

    try {
        const match = await db.Match.findOne({
            where: { id: matchId, user_id },
            include: [{
                model: db.Team_Match,
                as: "rounds",
                include: [{
                    model: db.Team,
                    as: "teams"
                }]
            }]
        });

        if (!match) {
            return res.status(404).json({ error: "Match not found." });
        }

        // Find the team with highest score
        const winner = match.rounds.reduce((prev, current) => 
            (prev.score > current.score) ? prev : current
        );

        // Check for ties
        const maxScore = winner.score;
        const winners = match.rounds.filter(round => round.score === maxScore);

        res.status(200).json({ 
            match,
            winner: winners.length === 1 ? winner : null,
            winners: winners.length > 1 ? winners : null,
            isTie: winners.length > 1,
            finalScores: match.rounds.map(round => ({
                team: round.teams.team_name,
                score: round.score
            }))
        });
    } catch (error) {
        console.error("Error getting winner:", error);
        res.status(500).json({ error: "Failed to get winner." });
    }
};


