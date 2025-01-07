// const io = require("../index"); 

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
const group = require("../model/Groupschema")

const message = async (req, res) => {
  const io = req.app.get("io");
  const { message, receivernumber } = req.body;

  // io.on("")

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

  io.emit("newpreviousMessage",{savesavefirstmessage, reciver: savesavefirstmessage._id})


  res
    .status(200)
    .json({ status: true, message: "Message sent", data: savesavefirstmessage });             
};

///////////////////////////// get spacifc messages ///////////////////////////

const getmessages = async (req, res) => {
  const io = req.app.get("io");
io.on("getmessage",(data)=>{
  console.log("getmessage",data)
})
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
io.emit("previousMessage",messages)
  res.status(200).json({ status: true, message: "get spacific user message", data: messages  });
};

////////////////////////// get message sended profiles /////////////////////////////////
const messagesenders = async (req, res) => {


  if (!req.user || !req.user.id) {
    return res.status(400).json({ success: false, message: 'User not authenticated.' });
  }

  const currentUserId = req.user.id;

  // Step 1: Find all user IDs the current user has messaged with
  const messagedUserIds = await messageschema.aggregate([
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


  const userIds = messagedUserIds.map((item) => item._id);

  if (userIds.length === 0) {
    return res.status(200).json({ success: true, users: [] });
  }

  const users = await User.find({ _id: { $in: userIds } }).populate({path:"profileimage",select:"profileimage"})

 
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
  const { query } = req.query; 

  if (!query) {
    return res.status(400).json({ message: "Search query is required." });
  }

  const contacts = await contact.find({
    $and: [
      { userid: req.user.id },
      {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { number: { $regex: query, $options: "i" } },
        ],
      },
    ],
  }).populate("profileimage")
  
  if(contacts==[]){
   return res.status(400).json({status:false,message:"number not found",})
  }
  // console.log("asndmbas",contacts)

  if (contacts.length === 0) {
    return res.status(404).json({ message: "No contacts found." });
  }

  res.status(200).json(contacts);
};

////////////////////////////////////  DELETE MESSAGES /////////////////////////////////////

const deletemessage = async (req,res)=>{
  // console.log("senderid",req.params.id)  
  const id = req.params.id; 
  // console.log("id",id)
  const findemessages = await messageschema.findOneAndDelete({_id:id})

  res.status(200).json({status:true,message:"itemdeleted"})
}

//////////////////////////////////////  STARING MESSAGE  //////////////////////////////

const starmessages = async (req,res)=>{
const id = req.params.id;
// console.log("SENDER ID",id)
const editstarfield = await messageschema.findOneAndUpdate({_id:id}, [{ $set: { star: { $not: "$star" } } }])
res.status(200).json({message:"item stared"})
}


/////////////////////////////////////////// GET CHAT DATA ///////////////////////////////////////////////////////////// 

const getChatData = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(400).json({ success: false, message: 'User not authenticated.' });
  }

  const currentUserId = req.user.id;

  try {
    const messagedUserIds = await messageschema.aggregate([
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

    const userIds = messagedUserIds.map((item) => item._id);

    const users = userIds.length > 0 
      ? await User.find({ _id: { $in: userIds } }).populate({ path: "profileimage", select: "profileimage" })
      : [];

    const groups = await group.find({
      $or: [
        { adminnumber: req.user.number },
        { 'members.number': req.user.number }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Fetched chat data successfully.',
      data: {
        users,
        groups
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching chat data.', error: error.message });
  }
};





module.exports = {
  message,
  getmessages,
  messagesenders,
  searchcontatcs,
  deletemessage,
  starmessages,
  getChatData

};
