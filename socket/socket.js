const http = require("http");
const { Server } = require("socket.io");
const messageschema = require("../model/message");
const express = require("express");

const app = express();

const server = http.createServer(app);
module.exports = { server, app, express };

const io = new Server(server, {
  cors: {
    origin: "*",
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
  socket.on("send_message", (data) => {
    console.log("Message received:", data);
     console.log("Received data:", req.body);
    
      let audios;
      let videos;
      let images;
    
      const findnumber = await contact.findOne({
        userid: req.user.id,
        number: receivernumber,
      });
    
      const files = req.file?.path;
      console.log("Uploaded file path:", files);
    
      if (files) {
        const fileExtension = path.extname(files).toLowerCase();
        console.log("File extension:", fileExtension, files);
    
        if ([".png", ".jpg", ".jpeg"].includes(fileExtension)) {
          images = files;
        }
    
        if ([".mp4", ".mkv"].includes(fileExtension)) {
          videos = files;
        }
    
        if ([".webm", ".mp3", ".aac", ".wav"].includes(fileExtension)) {
          audios = files;
        }
      }
    
      const savefirstmessage = new messageschema({
        senderid: req.user.id,
        reciverid: receivernumber,
        text: message,
        image: images,
        audio: audios,
        video: videos,
      });
    
      const savesavefirstmessage = await savefirstmessage.save();
    
      // Emit the message to the receiver's room
      console.log("Sending to room:", receivernumber);
      io.to(receivernumber).emit("new_message", {
        senderid: savesavefirstmessage.senderid,
        reciverid: savesavefirstmessage.reciverid,
        text: savesavefirstmessage.text,
        image: savesavefirstmessage.image,
        audio: savesavefirstmessage.audio,
        video: savesavefirstmessage.video,
      });
    io.to(data.room).emit("receive_message", data);
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});
