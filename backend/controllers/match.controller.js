const { where } = require("sequelize");
const db = require("../models");
const { model } = require("mongoose");

exports.createMatch = async (req, res) => {
    const { match_name, match_type, team_ids } = req.body;
    const user_id = req.user.id;

    // Validate input data
    if (!match_name || !match_type || !Array.isArray(team_ids) || team_ids.length === 0) {
        return res.status(400).json({ error: "Invalid input data. Ensure all fields are provided." });
    }

    try {
        // Check if the teams exist and belong to the user
        const existingTeams = await db.Team.findAll({ where: { id: team_ids, user_id } });

        // If some teams don't exist or don't belong to user, return error
        if (existingTeams.length !== team_ids.length) {
            return res.status(400).json({ error: "Some teams do not exist or don't belong to you." });
        }

        // Create a new match record
        const matchType = match_type.toLowerCase();
        const newMatch = await db.Match.create({ match_name, match_type: matchType, user_id });

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


