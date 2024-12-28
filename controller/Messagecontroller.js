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
const User = require('../model/loginSchema')

const message = async (req, res) => {

  const { message, receivernumber } = req.body;


  // if (!receivernumber) {
  //   return res
  //     .status(404)
  //     .json({
  //       status: false,
  //       message: "receiver not found",
  //       data: { message, receiverid },
  //     });
  // }
  console.log("outside",req.body);
  let audios;
  let videos;
  let images;


  const findnumber = await contact.findOne({                     
    userid: req.user.id,
    number: receivernumber,
  });



  const files = req.file?.path;
  console.log("dghsgfs", files);

  if (files) {
    const fileExtension = path.extname(files).toLowerCase(); 
    console.log("File extension:", fileExtension, files);

   
    if (
      fileExtension === ".png" ||
      fileExtension === ".jpg" ||
      fileExtension === ".jpeg"
    ) {
      images = files;
    }

    if (fileExtension === ".mp4" || fileExtension === ".mkv") {
      videos = files;
    }


    if (
      fileExtension === ".webm" ||
      fileExtension === ".mp3" ||
      fileExtension === ".aac" ||
      fileExtension === ".wav"
    ) {
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
   res.status(200).json({status:true, message: " message sended", data: savesavefirstmessage });
  
};

///////////////////////////// get spacifc messages ///////////////////////////

const getmessages = async (req, res) => {
  const reciverprofileId = req.params.id;
  const userId = req.user.id;

if(!reciverprofileId){
  return res.status(200).json({status:false,messagege:"reciverprofileId is undifined"})
}
  const messages = await messageschema.find({
    $or: [
      { senderid: userId, reciverid: reciverprofileId },
      { senderid: reciverprofileId, reciverid: userId },
    ], 
  }) 

  res.status(200).json({ status: true, message: "get spacific user message", data: messages  });
};

////////////////////////// get message sended profiles /////////////////////////////////
const messagesenders = async (req, res) => {


  if (!req.user || !req.user.id) {
    return res.status(400).json({ success: false, message: 'User not authenticated.' });
  }

  const currentUserId = req.user.id;

  // Step 1: Find all user IDs the current user has messaged with
  const messagedUserIds = await Message.aggregate([
    {
      $match: {
        $or: [
          { senderid: new mongoose.Types.ObjectId(currentUserId) },
          { reciverid: new mongoose.Types.ObjectId(currentUserId) }
        ]
      }
    },
    {
      $project: {
        contactId: {
          $cond: {
            if: { $eq: ['$senderid', new mongoose.Types.ObjectId(currentUserId)] },
            then: '$reciverid',
            else: '$senderid'
          }
        }
      }
    },
    { $group: { _id: '$contactId' } }
  ]);

  // Extract unique user IDs
  const userIds = messagedUserIds.map((item) => item._id);

  if (userIds.length === 0) {
    return res.status(200).json({ success: true, users: [] });
  }

  // Step 2: Fetch user profiles
  const users = await User.find({ _id: { $in: userIds } }).populate({path:"profileimage",select:"profileimage"})

  // Step 3: Send response
  res.status(200).json({status:true,message:"get all messsage senders", data:users});
  
//   const finding = await messageschema.find({
//       $or: [
//         { sendernumber: usercontactnumber },
//         { recivernumber: usercontactnumber },
//       ],
//     })
//     .populate({
//       path: "reciverid",
//       populate: { path: "profileimage" },
//     })
//     .populate({
//       path: "senderid",
//       populate: { path: "profileimage" },
//     });

//   console.log("finding", finding);
//   const findAndAggregate = await messageschema.aggregate([
//     {
//       $match: {
//         $or: [
//           { sendernumber: usercontactnumber },
//           { recivernumber: usercontactnumber },
//         ],
//       },
//     },
//     {
//       $group: {
//         _id: "$sendernumber",
//         recivernumber: {
//           $addToSet: "$recivernumber",
//         },
//         sendernumber: {
//           $addToSet: "$sendernumber",
//         },
//       },
//     },
//     {
//       $lookup: {
//         from: "contacts",
//         localField: "_id",
//         foreignField: "number",
//         as: "reciverDetails",
//       },
//     },
//   ]);

//   res
//     .status(200)
//     .json({
//       status: true,
//       messages: "message senders",
//       data: { aggrigateddata: findAndAggregate, findeddata: finding },
//     });
};


//////////////////////////  search contacts //////////////////////////


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
const deletemessage = async (req,res)=>{
  console.log("senderid",req.params.id)  
  const id = req.params.id; 
  console.log("id",id)
  const findemessages = await messageschema.findByIdAndDelete({_id:id})
  // const updatedMessages = findemessages.message.filter(item => item._id.toString() !== id);
  // findemessages.message = updatedMessages;

  res.status(200).json({status:true,message:"itemdeleted"})
}
//  //////////////////////////////// CHAT GPT MESSAGIN METHOD //////////////////////////////


//  const Message = require('../model/message');
// const Contact = require('../model/ContactSchema');

// const sendMessage = async (req, res) => {
//   const { receiverNumber, text } = req.body;
//   console.log("contactId",receiverNumber)           
//   const senderid = req.user.id

//   try {
//     // Check if the receiver exists
//     const contact = await Contact.findOne({ userid: senderId, number: receiverNumber });
//     if (!contact) {
//       return res.status(403).json({ message: 'Receiver is not in your contacts.' });
//     }

//     const message = new Message({
//       senderId,
//       receiverId: contact.profileimage,
//       text,
//     });

//     await message.save();
//     res.status(201).json({ message: 'Message sent successfully.', message });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error.', error });
//   }
// };


// ////////////////// FEATCH MESSAGE /////////////////////////


// // const Message = require('./models/Message');

// const getMessages = async (req, res) => {
//   const { contactId } = req.params;
//   console.log("contactId",contactId)           
//   const userId = req.user.id

//   try {
//     const messages = await Message.find({
//       $or: [
//         { senderId: userId, receiverId: contactId },
//         { senderId: contactId, receiverId: userId },
//       ],                  
//     }).sort({ timestamp: 1 });

//     res.status(200).json(messages);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error.', error });
//   }
// };

// ///////////////////// GET MESSAGED PROFILES //////////////////////

// const getMessagedUsers = async (req, res) => {
//   try {
//     // Validate user
//     if (!req.user || !req.user.id) {
//       return res.status(400).json({ success: false, message: 'User not authenticated.' });
//     }

//     const currentUserId = req.user.id;

//     // Step 1: Find all user IDs the current user has messaged with
//     const messagedUserIds = await Message.aggregate([
//       {
//         $match: {
//           $or: [
//             { senderId: new mongoose.Types.ObjectId(currentUserId) },
//             { receiverId: new mongoose.Types.ObjectId(currentUserId) }
//           ]
//         }
//       },
//       {
//         $project: {
//           contactId: {
//             $cond: {
//               if: { $eq: ['$senderId', new mongoose.Types.ObjectId(currentUserId)] },
//               then: '$receiverId',
//               else: '$senderId'
//             }
//           }
//         }
//       },
//       { $group: { _id: '$contactId' } }
//     ]);

//     // Extract unique user IDs
//     const userIds = messagedUserIds.map((item) => item._id);

//     if (userIds.length === 0) {
//       return res.status(200).json({ success: true, users: [] });
//     }

//     // Step 2: Fetch user profiles
//     const users = await User.find({ _id: { $in: userIds } }).select('name number profileimage');

//     // Step 3: Send response
//     res.status(200).json({
//       success: true,
//       users
//     });
//   } catch (error) {
//     console.error('Error finding messaged users:', error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };







module.exports = {
  message,
  getmessages,
  messagesenders,
  searchcontatcs,
  deletemessage,
  // sendMessage,
  // getMessages,
  // getMessagedUsers,
};
