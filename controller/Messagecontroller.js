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
const path = require('path');
const mongoose = require("mongoose");

const message = async (req, res) => {
    console.log("outside")
    let audios
    let videos 
    let images 
    
    const { message, receiver } = req.body;
    const sender = receiver == req.user.contactid
    if(sender){
      return res.status(404).json({status:false,message:"receiver and snder is same"})
    }
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
      .status(404).json({status: false, message: "receiver not found",data: { message, receiver },});
  }
  const contacts = await contact.findOne({ userid: req.user.id });

  // const findid = contacts.contacts.find((value) => {
  //   return value._id == receiver;
  // });
  // console.log("jsahdjshad",findid);
  
  // if (!findid) {
  //   return res
  //     .status(404)
  //     .json({ status: false, message: "invalid receiver", data: receiver });
  // }
  const messageer = await messageschema.find({ senderid: req.user.id });

  if (!messageer) {
    const savefirstmessage = new messageschema({
      senderid: req.user.contactid,
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
        senderid: req.user.contactid,
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
  const senderid = req.user.contactid;

  const messages = await messageschema.findOne({
    reciverid,
    senderid,
  }).populate("reciverid").populate("senderid")

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



const messagesenders = async (req,res)=>{
  const usercontactid = req.user.contactid
//   const findMessages = await messageschema.find({
//     $or: [
//         { reciverid: usercontactid },
//         { senderid: usercontactid }
//     ]
// });
const findAndAggregate = await messageschema.aggregate([
  {
    $match: {
      $or: [
        { reciverid: new mongoose.Types.ObjectId(usercontactid) },
        { senderid: new mongoose.Types.ObjectId(usercontactid) }
      ]
    }
  },
  {
    $group: {
      _id: "$reciverid" 
    }
  },
  {
    $lookup: {
      from: "contacts", 
      localField: "_id", 
      foreignField: "_id", 
      as: "reciverDetails"
    }
  }
]);

  res.status(200).json({status:true,messages:"message senders",data:findAndAggregate})


}

module.exports = {
  message,
  getmessages,
  messagesenders,
};
