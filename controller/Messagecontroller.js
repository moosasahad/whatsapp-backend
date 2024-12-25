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
const path = require("path");
const mongoose = require("mongoose");

const message = async (req, res) => {
  console.log("outside",req.body);
  let audios;
  let videos;
  let images;

  const { message, receiverid, receivernumber } = req.body;
  const sender = receiverid == req.user.contactid;
  if (sender) {
    return res
      .status(404)
      .json({ status: false, message: "receiver and snder is same" });
  }
  const findnumber = await contact.findOne({
    userid: req.user.id,
    number: receivernumber,
  });

  if (!findnumber) {
    res.status(400).json({ status: false, message: "number not saved" });
  }

  const files = req.file?.path;
  console.log("dghsgfs", files);

  if (files) {
    const fileExtension = path.extname(files).toLowerCase(); // Ensure lowercase comparison
    console.log("File extension:", fileExtension, files);

   
    if (
      fileExtension === ".png" ||
      fileExtension === ".jpg" ||
      fileExtension === ".jpeg"
    ) {
      images = files;
    }

    // Check for video formats
    if (fileExtension === ".mp4" || fileExtension === ".mkv") {
      videos = files;
    }

    // Check for audio formats
    if (
      fileExtension === ".webm" ||
      fileExtension === ".mp3" ||
      fileExtension === ".aac" ||
      fileExtension === ".wav"
    ) {
      audios = files; // Correctly assign audio file
    }
  }

  if (!receiverid || !receivernumber) {
    return res
      .status(404)
      .json({
        status: false,
        message: "receiver not found",
        data: { message, receiverid },
      });
  }

  const messageer = await messageschema.findOne({
    sendernumber: req.user.number,
    recivernumber: receivernumber,
  });
  console.log("messageer", messageer);

  if (!messageer) {
    const savefirstmessage = new messageschema({
      senderid: req.user.contactid,
      sendernumber: req.user.number,
      reciverid: receiverid,
      recivernumber: receivernumber,
      message: [
        {
          sendernumber: req.user.number,
          text: message,
          image: images,
          audio: audios,
          video: videos,
        },
      ],
    });
    const savesavefirstmessage = await savefirstmessage.save();
    return res
      .status(200)
      .json({ message: "first message sended", data: savesavefirstmessage });
  } else {
    messageer.message.push({
      sendernumber: req.user.number,
      text: message,
      image: images,
      audio: audios,
      video: videos,
    });
    await messageer.save();
    return res.status(200).json({ message: "message sended", data: messageer });
  }
};

// if (!sender) {
//   const savefirstmessage = new messageschema({
//     senderid: req.user.contactid,
//     sendernumber:req.user.number,
//     reciverid: receiverid,
//     recivernumber:receivernumber,
//     message: [
//       {
//         text: message,
//         image:images,
//         audio:audios,
//         video:videos,
//       },
//     ],
//   });
//   const savesavefirstmessage = await savefirstmessage.save();
//   return res
//     .status(200)
//     .json({ message: "first message sended", data: savesavefirstmessage });
// } else {

//--------------------------- getmessage ------------------------------//

const getmessages = async (req, res) => {
  // console.log("sdfghj")
  // const sendernumber = req.user.number;
  // console.log("recivernumber parems", req.params.recivernumber);

  // const recivernumber = req.params.recivernumber;
  // console.log("recivernumber", recivernumber);

  // const messages = await messageschema
  //   .findOne({ sendernumber: sendernumber, recivernumber: recivernumber })
  //   .populate({
  //     path: "reciverid",

  //     populate: {
  //       path: "profileimage",
  //       select: "profileimage",
  //     },
  //   })           
  //   .populate({
  //     path: "senderid",

  //     populate: {
  //       path: "profileimage",
  //       select: "profileimage",
  //     },
    // })

  // const reciever =(await contact.findOne({ userid: senderid }).populate("contacts.profileimage",'profileimage'))?.contacts
  //     ?.find((con) => con._id == reciverid)

  const recivernumber = req.params.recivernumber;

  const messages = await messageschema.findOne({_id:recivernumber}) 
  .populate({
        path: "reciverid",
  
        populate: {
          path: "profileimage",
          select: "profileimage",
        },
      })           
      .populate({
        path: "senderid",
  
        populate: {
          path: "profileimage",
          select: "profileimage",
        }, 
      })
  
  



  res
    .status(200)
    .json({ status: true, message: "get message", data: { messages } });
};

const messagesenders = async (req, res) => {
  const usercontactnumber = req.user.number;
  //   const findMessages = await messageschema.find({
  //     $or: [
  //         { reciverid: usercontactnumber },
  //         { senderid: usercontactnumber }
  //     ]
  // });
  const finding = await messageschema
    .find({
      $or: [
        { sendernumber: usercontactnumber },
        { recivernumber: usercontactnumber },
      ],
    })
    .populate({
      path: "reciverid",
      populate: { path: "profileimage" },
    })
    .populate({
      path: "senderid",
      populate: { path: "profileimage" },
    });

  console.log("finding", finding);
  const findAndAggregate = await messageschema.aggregate([
    {
      $match: {
        $or: [
          { sendernumber: usercontactnumber },
          { recivernumber: usercontactnumber },
        ],
      },
    },
    {
      $group: {
        _id: "$sendernumber",
        recivernumber: {
          $addToSet: "$recivernumber",
        },
        sendernumber: {
          $addToSet: "$sendernumber",
        },
      },
    },
    {
      $lookup: {
        from: "contacts",
        localField: "_id",
        foreignField: "number",
        as: "reciverDetails",
      },
    },
  ]);

  res
    .status(200)
    .json({
      status: true,
      messages: "message senders",
      data: { aggrigateddata: findAndAggregate, findeddata: finding },
    });
};

const searchcontatcs = async (req, res) => {
  const { query } = req.query; // Get the search query from request query parameters

  if (!query) {
    return res.status(400).json({ message: "Search query is required." });
  }

  const contacts = await contact.find({
    userid: req.user.id,
    $or: [
      { name: { $regex: query, $options: "i" } },
      { number: { $regex: query, $options: "i" } },
    ],
  });
  
  if(contacts==[]){
   return res.status(400).json({status:false,message:"number not found",})
  }
  console.log("asndmbas",contacts)

  if (contacts.length === 0) {
    return res.status(404).json({ message: "No contacts found." });
  }

  res.status(200).json(contacts);
};

module.exports = {
  message,
  getmessages,
  messagesenders,
  searchcontatcs,
};
