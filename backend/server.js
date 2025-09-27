const express = require('express');
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust this to match your frontend's origin
    },
});

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

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
const matchRouter = require('./routes/match.route')
const registerRouter = require("./routes/register.route")
const loginTouter = require("./routes/auth.route")
const refreshTokenRouter = require("./routes/refreshToken.route")
const bodyParser = require('body-parser');
const cors = require('cors')

app.use(cors({
    origin: "http://localhost:5177",
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
app.use("/api/team", teamRouter)
app.use("/api/match", matchRouter)
app.use("/api/question", questionRouter)
app.use("/api/buzzer", buzzerRouter)
db.sequelize.sync().then(() => {

    server.listen(port, (req, res) => {
        console.log(`Server is running on port ${port}`);
    })
}).catch((err) => {
    console.log(err)
})




