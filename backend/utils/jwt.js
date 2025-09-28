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
    console.log('Auth header:', authHeader);
    if (!authHeader?.startsWith("Bearer ")) {
        console.log('No Bearer token found');
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    console.log('Extracted token:', token);
    console.log('ACCESS_TOKEN_SECRET:', ACCESS_TOKEN_SECRET);
    jwt.verify(token, ACCESS_TOKEN_SECRET, (error, decode) => {
        if (error) {
            console.log('JWT verification error:', error.message);
            return res.status(403).json({ message: "Forbidden" });
        }
        console.log('JWT decoded:', decode);
        req.id = decode.id;
        next();
    });
};

module.exports = { generateToken, verifyAccessToken, generateRefreshToken };
