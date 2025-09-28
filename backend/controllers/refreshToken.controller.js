require("dotenv").config();

const db = require("../models");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/jwt");
const { where } = require("sequelize");

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt_refresh_token) return res.status(401);

    const refreshToken = cookies.jwt_refresh_token;

    const founUser = await db.User.findOne({
        where: { refresh_token: refreshToken },
    });

    if (!founUser) return res.status(403);
    console.log(founUser.username);

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (error, decode) => {
            if (error || founUser.username !== decode.username)
                return res.status(403).json({ message: "Forbidden" });
            const accessToken = generateToken({ id: founUser.id });
            res.json({ accessToken });
        }
    );
};

module.exports = { handleRefreshToken };
