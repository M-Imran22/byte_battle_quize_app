const db = require('../models');
const { Op, where } = require('sequelize');

exports.createBuzzerPress = async (req, res) => {
    try {
        const buzzer = await db.BuzzerPress.create({
            teamName: req.body.teamName,
            timestamp: new Date()
        });

        res.status(201).json(buzzer);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getBuzzerQueue = async (req, res) => {
    try {
        const queue = await db.BuzzerPress.findAll({
            where: { status: 'pending' },
            order: [['timestamp', 'ASC']],
            limit: 100
        });

        res.json(queue);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteAllBuzzers = async (req, res) => {
    try {
        await db.BuzzerPress.destroy({
            where: {},
            truncate: true,
        });

        global.io.emit("buzzersReset"); // Notify all clients
        return res.status(200).json({ message: "All buzzers deleted successfully." });
    } catch (error) {
        console.error("Failed to delete all buzzers:", error);
        return res.status(500).json({ error: "Failed to delete all buzzers." });
    }
};