require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const router = require('./Routes/Router');
const cookieParser = require('cookie-parser');
const cors = require('cors'); // Correct CORS package
const http = require('http');
const { Server } = require('socket.io');

// Initialize Express App
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000",         
  credentials: true,
}));
app.use(router);


const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected",socket);
}) 

//   socket.on("sendMessage", (data) => {
//     console.log(`Message received from ${socket.id}:`, data);

//     io.emit("receiveMessage", {
//       sender: socket.id,
//       message: data.message,
//     });
//   });

 
//   socket.on("disconnect", () => {
//     console.log(`User ${socket.id} disconnected`);
//   });
// });


mongoose
  .connect(process.env.CONECTTIN_URL, {
    serverSelectionTimeoutMS: 30000,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

server.listen(process.env.PORT, () => {
  console.log("Server is running at port", process.env.PORT);
});

module.exports = io ;  
