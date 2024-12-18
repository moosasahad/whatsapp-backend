// const io = require("../index"); // Import the io instance from index.js

// const sendmessage = async (req, res) => {

//         const { message } = req.body;

//         if (!message) {
//             return res.status(400).json({ error: "Message is required" });
//         }

//         console.log("HTTP Message Received:", message);

//         // Emit the message to all connected clients
//         io.emit("receiveMessage", {
//             sender: "Server",
//             message: message
//         });

//         res.status(200).json({ success: true, message: "Message sent successfully" });
// };

// module.exports = {
//     sendmessage,
// };

const messageschema = require("../model/message");
const contact = require("../model/ContactSchema");
const path = require('path')

const message = async (req, res) => {
    console.log("outside")
    let audios
    let videos 
    let images 
    
    const { message, receiver } = req.body;
    const files = req.file?.path;
    console.log("dghsgfs",files);
    
    
    if (files) {
        const fileExtension = path.extname(files).toLowerCase(); // Ensure lowercase comparison
        console.log("File extension:", fileExtension, files);
    
        // Check for image formats
        if (fileExtension === ".png" || fileExtension === ".jpg" || fileExtension === ".jpeg") {
            images = files;
        }
    
        // Check for video formats
        if (fileExtension === ".mp4" || fileExtension === ".mkv") {
            videos = files;
        }
    
        // Check for audio formats
        if (fileExtension === ".webm" || fileExtension === ".mp3" || fileExtension === ".aac" || fileExtension === ".wav") {
            audios = files; // Correctly assign audio file
        }
    }
  
  if ( !receiver) {
    return res
      .status(404)
      .json({
        status: false,
        message: "receiver not found",
        data: { message, receiver },
      });
  }
  const contacts = await contact.findOne({ userid: req.user.id });

  const findid = contacts.contacts.find((value) => {
    return value._id == receiver;
  });
  if (!findid) {
    return res
      .status(404)
      .json({ status: false, message: "invalid receiver", data: receiver });
  }
  const messageer = await messageschema.find({ senderid: req.user.id });

  if (!messageer) {
    const savefirstmessage = new messageschema({
      senderid: req.user.id,
      reciverid: receiver,
      message: [
        {
          text: message,
          image:images,
          audio:audios,
          video:videos,
        },
      ],
    });
    const savesavefirstmessage = await savefirstmessage.save();
    return res
      .status(200)
      .json({ message: "first message sended", data: savesavefirstmessage });
  } else {
    const sender = messageer.find((value) => {
      return value.reciverid == receiver;
    });

    if (!sender) {
      const savefirstmessage = new messageschema({
        senderid: req.user.id,
        reciverid: receiver,
        message: [
          {
            text: message,
            image:images,
            audio:audios,
            video:videos,
          },
        ],
      });
      const savesavefirstmessage = await savefirstmessage.save();
      return res
        .status(200)
        .json({ message: "first message sended", data: savesavefirstmessage });
    } else {
      sender.message.push({
        text: message,
        image:images,
        audio:audios,
        video:videos,

      });
      await sender.save();
      return res.status(200).json({ message: "message sended", data: sender });
    }
  }
};
const getmessages = async (req, res) => {
  const reciverid = req.params.reciverid;
  const senderid = req.user.id;

  const messages = await messageschema.findOne({
    reciverid,
    senderid,
  });

    const reciever =(await contact.findOne({ userid: senderid }).populate("contacts.profileimage",'profileimage'))?.contacts
        ?.find((con) => con._id == reciverid)


  res
    .status(200)
    .json({
      status: true,
      message: "get message",
      data: { messages, reciever },
    });
};

module.exports = {
  message,
  getmessages,
};
