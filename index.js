const express = require('express');
const app = express();
const port = 3000
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jobRouter = require('./routers/job');
const authRouter = require('./routers/auth');
const userRouter = require('./routers/user');
const bookmarkRouter = require('./routers/bookmark');
const chatRouter = require('./routers/chat');
const messageRouter = require('./routers/message');
const jobcategoriesRouter = require('./routers/jobcategories');
const bodyParser = require('body-parser');
const path = require('path');

dotenv.config();

const admin = require('firebase-admin');

const serviceAccountJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString("utf-8");
const serviceAccount = JSON.parse(serviceAccountJson);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

mongoose.connect(process.env.MONGO_URL)
    .then(()=> console.log('connect'))
    .catch(err => console.log(err));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/jobs', jobRouter);

app.use('/api/', authRouter);

app.use('/api/users', userRouter);

app.use('/api/bookmarks', bookmarkRouter);

app.use('/api/chats', chatRouter);

app.use('/api/messages', messageRouter);

app.use('/api/jobcategories', jobcategoriesRouter);

// Phục vụ file tĩnh từ thư mục "public"
app.use(express.static(path.join(__dirname, 'public')));

// Điều hướng tất cả request khác về index.html (cho frontend SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = app.listen(process.env.PORT || port, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: "https://jobappbackend-production-5db4.up.railway.app/"
    }
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userId) => {
        socket.join(userId);
        socket.broadcast.emit("online-user", userId);
        console.log(userId)
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });

    socket.on("typing", (room) => {
        console.log("typing")
        console.log("room")
        socket.to(room).emit("typing", room)
    });
    
    socket.on("stop typing", (room) => {
        console.log("stop typing")
        console.log("room")
        socket.to(room).emit("stop typing", room)
    });

    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;
        var room = chat._id;

        var sender = newMessageRecieved.sender;

        if(!sender || sender._id) return console.log("sender not defined");
        
        var senderId = sender._id;
        console.log(senderId + "message sender");
        const users = chat.users;
        
        if (!user) return console.log("chat.users not defined");

        socket.to(room).emit("message recieved", newMessageRecieved);
        socket.to(room).emit("message sent", "new message");
    });

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userId);
    });
})