const express = require('express');
const http = require("http");
const { Server } = require("socket.io");
const jwt = require('jsonwebtoken');
const { verifyAccessToken } = require('./utils/jwt');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        credentials: true
    },
});

// Socket authentication middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (!err) {
                socket.user = user;
            }
        });
    }
    
    // Allow connection even without token (for buzzers)
    next();
});

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id, socket.user?.username);

    // Rate limiting for buzzer presses
    let lastBuzzerPress = 0;
    const BUZZER_COOLDOWN = 1000; // 1 second

    // Handle buzzer press with validation
    socket.on('buzzer-press', async (data) => {
        const now = Date.now();
        if (now - lastBuzzerPress < BUZZER_COOLDOWN) {
            return socket.emit('error', 'Please wait before pressing again');
        }

        if (!data.teamName || !data.timestamp) {
            return socket.emit('error', 'Invalid buzzer data');
        }

        lastBuzzerPress = now;
        console.log('Buzzer pressed:', data);
        
        // Save to database
        try {
            await db.BuzzerPress.create({
                teamName: data.teamName.trim(),
                timestamp: data.timestamp,
                status: 'pending'
            });
        } catch (error) {
            console.error('Error saving buzzer press:', error);
        }
        
        io.emit('buzzer-pressed', data);
    });

    // Handle buzzer reset (admin only)
    socket.on('reset-buzzers', () => {
        console.log('Buzzers reset by:', socket.user?.username);
        io.emit('buzzers-reset');
    });

    // Handle score updates (admin only)
    socket.on('scores-updated', (data) => {
        if (!data.matchId || !data.scores) {
            return socket.emit('error', 'Invalid score data');
        }

        console.log('Scores updated:', data);
        io.emit('scores-updated', data);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});

global.io = io; // Make io globally accessible

const port = 3000;
const db = require('./models')
const buzzerRouter = require("./routes/buzzer.route")
const teamRouter = require("./routes/team.route")
const questionRouter = require('./routes/question.route')
const aiQuestionRouter = require('./routes/aiQuestion.route')
const matchRouter = require('./routes/match.route')
const registerRouter = require("./routes/register.route")
const loginTouter = require("./routes/auth.route")
const refreshTokenRouter = require("./routes/refreshToken.route")
const bodyParser = require('body-parser');
const cors = require('cors')

app.use(cors({
    origin: true, // Allow all origins for development
    credentials: true

}))

app.get('/', (req, res) => {
    res.send('Welcome to Quiz App');
})

// app.get('/team/addteam', (req, res) => {
//     res.send('Welcome to Quiz App');
// })
app.use(bodyParser.json())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use("/api/register", registerRouter)
app.use("/api/login", loginTouter)
app.use("/api/refresh_token", refreshTokenRouter)
// Public endpoint for buzzer teams (by match)
app.get('/api/public/teams/:matchId', async (req, res) => {
    try {
        const { matchId } = req.params;
        const match = await db.Match.findByPk(matchId, {
            include: [{
                model: db.Team_Match,
                as: 'rounds',
                include: [{
                    model: db.Team,
                    as: 'teams'
                }]
            }]
        });
        
        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }
        
        const teams = match.rounds.map(r => r.teams);
        res.json({ teams });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});
app.use("/api/team", verifyAccessToken, teamRouter)
app.use("/api/match", verifyAccessToken, matchRouter)
app.use("/api/question", verifyAccessToken, questionRouter)
app.use("/api/ai-question", verifyAccessToken, aiQuestionRouter)
app.use("/api/buzzer", verifyAccessToken, buzzerRouter)
db.sequelize.sync().then(() => {

    server.listen(port, (req, res) => {
        console.log(`Server is running on port ${port}`);
    })
}).catch((err) => {
    console.log(err)
})




