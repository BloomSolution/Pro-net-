const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const dbconnection = require('./config/db'); 
const socketIo = require('socket.io');
const http = require('http');  // Import http to create the server
const path = require('path');  // Required for path module
const MessageModel = require('./app/models/chat');

// Config
dotenv.config();

const cors = require('cors');
const corsOptions = {    
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',  
            'https://jointogainnew.vercel.app'
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '70mb', extended: true, parameterLimit: 1000000 }));
app.use(express.static(path.join(__dirname, 'public')));

// Connect Database
dbconnection()

// Router setup (assuming you have a router file)
const router = require('./router');
app.use('/api', router);

app.get('/', (req, res) => {
    res.json({ "message": "This is for testing" });
});

// Create server using http.createServer
const server = http.createServer(app);

// Initialize Socket.IO with the server instance
const io = socketIo(server, {
    cors: {
        origin: '*',
    },
});

io.on('connection', socket => {
    console.log('New client connected');

    socket.on('join', ({ userId }) => {
        socket.join(userId);
        console.log(`${userId} joined the chat`);
    });

    socket.on('sendMessage', async (data) => {
        const { senderId, receiverId, message } = data;

        try {
            const chatMessage = new MessageModel({ senderId, receiverId, message });
            await chatMessage.save();

            io.to(receiverId).emit('receiveMessage', chatMessage);
        } catch (err) {
            console.error("Message saving failed:", err.message);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Start Server
const PORT = process.env.PORT || 4009;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting Down Server due to Unhandled Promise Rejection`);

    server.close(() => {
        process.exit(1);
    });
});
