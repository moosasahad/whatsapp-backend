
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const messageschema = require("../model/message");
const express = require("express");
const path = require("path")
const fs = require("fs")
const app = express();

const server = http.createServer(app);
module.exports = { server, app, express };

const io = new Server(server, {
  cors: {
    origin: process.env.FROND_END_URL,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Client joins a room
  socket.on("joinRooms", async (userid, user) => {
    console.log("usr", userid.id, "    ", user._id);

    //   socket.join(userid);
    console.log(
      ".........................................................................................................."
    );
    const reciverprofileId = userid.id;
    const messages = await messageschema.find({   
      $or: [
        { senderid: user._id, reciverid: reciverprofileId },
        { senderid: reciverprofileId, reciverid: user._id },
      ],
    });    
    console.log(messages, "sssssssssssssss"); 

    io.emit("previousMessage", messages);
  });

  // Handle incoming messages
  socket.on("send_message", async (data) => {
    console.log("Message received:", data);
  
     const {receivernumber,message,files,usreid} = data;

     if (files) {
        // Extract MIME type from base64 data
        const mimeType = files.data.match(/^data:(\w+\/\w+);base64,/)[1]; // e.g., "image/png"
      
        // Log the file type
        console.log("MIME Type:", mimeType);
      
        // Check the file type
        if (mimeType.startsWith("image/")) {
          console.log("This is an image file.");
        } else if (mimeType.startsWith("video/")) {
          console.log("This is a video file.");
        } else if (mimeType.startsWith("audio/")) {
          console.log("This is an audio file.");
        } else {
          console.log("Unknown file type.");
        }
      
        // Save the file
        const base64Data = files.data.replace(/^data:\w+\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const filePath = path.join(__dirname, "uploads", files.name);
      
        fs.writeFile(filePath, buffer, (err) => {
          if (err) {
            console.error("Error saving file:", err);
            return;
          }
          console.log(`File saved: ${filePath}`);
        });
      }
      
        console.log("jfhsdghfgsdhgfhjfd",files)
        const savefirstmessage = new messageschema({
            senderid: usreid,
            reciverid: receivernumber,
            text: message,
            image: files && files.type.startsWith("image/") ? files : null,
            audio: files && files.type.startsWith("audio/") ? files : null,
            video: files && files.type.startsWith("video/") ? files : null,
          });
          
        
           
    //   let audios;               
    //   let videos;
    //   let images;       

    
    //   if (files) {
    //     const fileExtension = path.extname(files).toLowerCase();
    //     console.log("File extension:", fileExtension, files);
    
    //     if ([".png", ".jpg", ".jpeg"].includes(fileExtension)) {
    //       images = files;
    //     }
    
    //     if ([".mp4", ".mkv"].includes(fileExtension)) {
    //       videos = files;
    //     }
    
    //     if ([".webm", ".mp3", ".aac", ".wav"].includes(fileExtension)) {
    //       audios = files;
    //     }
    //   }
    
    
    //   const savemessage = await savefirstmessage.save();
    // console.log("previousMessage",savemessage)
    // //   Emit the message to the receiver's room
    // //   console.log("Sending to room:", receivernumber);
    //   io.emit("newpreviousMessage",savemessage);
    // io.to(data.room).emit("receive_message", data);                               
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});
app.set("io", io);