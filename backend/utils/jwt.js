require("dotenv").config();
const jwt = require("jsonwebtoken");
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
    });
};

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
        expiresIn: "1d",
    });
};

const verifyAccessToken = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, ACCESS_TOKEN_SECRET, (error, decode) => {
        if (error) {
            return res.status(403).json({ message: "Forbidden" });
        }
        req.user = { id: decode.id };
        req.id = decode.id;
        next();
    });
};

module.exports = { generateToken, verifyAccessToken, generateRefreshToken };
