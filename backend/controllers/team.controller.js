const { where } = require("sequelize");
const db = require("../models");

exports.createTeam = async (req, res) => {
    try {
        const { team_name, description } = req.body;
        const user_id = req.user.id;

        // Validate input
        if (!team_name || !description) {
            return res.status(400).json({ error: "Team name and description are required." });
        }

        // Create the team
        const newTeam = await db.Team.create({
            team_name,
            description,
            user_id
        });

        res.status(201).json({ message: "Team added successfully!", team: newTeam });
    } catch (error) {
        console.error("Error saving team: ", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllTeams = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { count, rows: teams } = await db.Team.findAndCountAll({
            where: { user_id }
        });
        res.status(200).json({ teams })
    } catch (error) {
        console.error("Error fetching teams: ", error);
        res.status(500).json({ error: "Failed to fetch teams." });
    }
};

exports.destroyTeam = async (req, res) => {
    const teamId = req.params.id;
    const transaction = await db.sequelize.transaction();

    try {
        const team = await db.Team.findByPk(teamId);

        if (!team) {
            return res.status(404).json({ error: "Team not found." });
        }

        // Delete associated records in Team_Match and the team within a transaction
        await Promise.all([
            db.Team_Match.destroy({
                where: { team_id: teamId },
                transaction
            }),
            team.destroy({ transaction })
        ]);

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: `Team ${team.team_name} deleted successfully.`,
            deletedTeamId: teamId
        });
    } catch (error) {
        await transaction.rollback();
        console.error(`Failed to delete team with id ${teamId}: `, error);
        res.status(500).json({
            success: false,
            error: "Failed to delete team.",
            details: error.message
        });
    }
};

exports.editTeam = async (req, res) => {
    const teamId = req.params.id;

    try {
        const team = await db.Team.findByPk(teamId);

        if (!team) {
            return res.status(404).json({ error: "Team not found in the DB." });
        }

        res.status(200).json({ team });
    } catch (error) {
        console.error("Error fetching team from DB: ", error);
        res.status(500).json({ error: "Failed to fetch team from DB." });
    }
};

exports.updateTeam = async (req, res) => {
    const teamId = req.params.id;
    const { team_name, description } = req.body;
    const transaction = await db.sequelize.transaction();

    try {
        const team = await db.Team.findByPk(teamId);

        if (!team) {
            return res.status(404).json({ error: "Team not found in DB." });
        }

        const updatedFields = {
            team_name: team_name || team.team_name,
            description: description || team.description
        };

        await db.Team.update(updatedFields, {
            where: { id: teamId },
            transaction
        });

        await transaction.commit();

        res.status(200).json({ message: "Team updated successfully.", team: { ...team, ...updatedFields } });
    } catch (error) {
        console.error(`Failed to update team with id ${teamId}: `, error);
        await transaction.rollback();
        res.status(500).json({ error: "Failed to update team." });
    }
};
