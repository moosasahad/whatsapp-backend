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

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (can be restricted in production)
    methods: ["GET", "POST"],
  },
});

// Socket.IO Events
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle incoming messages
  socket.on("sendMessage", (data) => {
    console.log(`Message received from ${socket.id}:`, data);

    // Broadcast the message to all connected clients
    io.emit("receiveMessage", {
      sender: socket.id,
      message: data.message,
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

// MongoDB Connection
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

// Start the Server
server.listen(process.env.PORT, () => {
  console.log("Server is running at port", process.env.PORT);
});

// Export Socket.IO instance
module.exports = io ;  
