require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const router = require('./Routes/Router')
const cookieparse = require('cookie-parser')
const core = require('cores')
const http = require('http')
const {Server} = require('socket.io')
 
const app = express()
app.use(express.json())
app.use(cookieparse())
app.use(router)
app.use(core)
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('sendMessage', (message) => {
      io.emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
  });
});


mongoose.connect(process.env.CONECTTIN_URL,
    {
        serverSelectionTimeoutMS: 30000,      
      })
      .then(() => {
        console.log("Connected to MongoDB");
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error);
      });


server.listen(process.env.PORT,()=>{
    console.log('server runned at ',process.env.PORT)
})
