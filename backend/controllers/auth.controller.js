const db = require("../models");
const bcrypt = require("bcrypt");
const { generateToken, generateRefreshToken } = require("../utils/jwt");

const handleLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.User.findOne({ where: { email } });

        if (!user) {
            console.log("User not found");
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            console.log("incorrect password");
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const accessToken = generateToken(user.id);
        const refreshToken = generateRefreshToken({ id: user.id });

        user.refresh_token = refreshToken;
        await user.save();

        res.cookie("jwt_refresh_token", refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        });


        res.status(201).json({ message: "Login successful.", accessToken });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
};

module.exports = { handleLogin };
