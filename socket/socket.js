
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const messageschema = require("../model/message");
const express = require("express");
const path = require("path")
const fs = require("fs")
const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FROND_END_URL,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    console.log(`User joined room: ${userId}`);
    socket.join(userId); // Join a room with the user ID
  });


  
    // Listen for the offer from the client
    socket.on("offer", (offer, to) => {
      console.log("Sending offer to:", to);
      io.to(to).emit("offer", offer, socket.id);
    });
  
    // Listen for the answer from the client
    socket.on("answer", (answer, to) => {
      console.log("Sending answer to:", to);
      io.to(to).emit("answer", answer);
    });
  
    // Listen for ICE candidates from the client
    socket.on("ice-candidate", (candidate, to) => {
      console.log("Sending ice-candidate to:", to);
      io.to(to).emit("ice-candidate", candidate);
    });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});


// io.on('connection', (socket) => { 
//     console.log("New user connected", socket.id);
  
//     // Listen for offer from the client
//     socket.on('offer', (offer, to) => {
//       io.to(to).emit('offer', offer);
//     });
  
//     // Listen for answer from the client
//     socket.on('answer', (answer, to) => {
//       io.to(to).emit('answer', answer);
//     });
  
//     // Listen for ICE candidates
//     socket.on('ice-candidate', (candidate, to) => {
//       io.to(to).emit('ice-candidate', candidate);
//     });
  
//     socket.on('disconnect', () => {
//       console.log('User disconnected');
//     });
//   });
app.set("io", io); 
module.exports = { server, app, express,io };
