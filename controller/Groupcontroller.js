const group = require("../model/Groupschema");
const contact = require("../model/ContactSchema");
const user = require("../model/loginSchema");
const path = require('path');
const { findOne } = require("../model/message");

// ----------------------- creating group -------------------- \\
const creategroup = async (req, res) => {
  const { groupName, members } = req.body;
  console.log("jhgfds", groupName, members);

  const newgroup = await new group({
    groupName,
    adminnumber: req.user.number,
    members: members.map((item) => ({
      membersid: item.membersid,
      number: item.number,
    })),
    admin: req.user.id,
  });

  const saevgroup = await newgroup.save();
  res
    .status(200)
    .json({ status: true, message: "group crated", data: saevgroup });
};

// --------------------------------- get groups ------------------------------- //

const getgroups = async (req, res) => {
  const findGroup = await group
    .find({
      $or: [
        { adminnumber: req.user.number },
        { "members.number": req.user.number },
      ],
    })
    .populate({
      path: "admin",

      populate: {
        path: "profileimage",
        select: "profileimage",
      },
    })
    .populate({
      path: "members.membersid",
    })
    .populate({
      path: "members.membersid",
      populate: { path: "profileimage", select: "profileimage" },
    });

  res
    .satatus(200)
    .json({ status: true, message: "get all groups", data: findGroup });
};

// -------------------------------------- sende message in group ----------------------------- //

const sendmessageongroup = async (req, res) => {
  const { groupid, message } = req.body;
  console.log("message",req.body)

  let audios;
  let videos;
  let images;

  const files = req.file?.path;
  console.log("imagefile", files);

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


  const findgroup =await group.findOne({_id:groupid})
  console.log("findgroup",findgroup)
   findgroup.messages.push({
    sender:req.user.id,
    sendernumber:req.user.number,
    text: message,
    image: images,
    audio: audios,
    video: videos,
})
  await findgroup.save()

  res.status(200).json({status:true,message:"message sended",data:findgroup})
};


// ------------------------- get spacfic group message ---------------------------------- ///


const getgroupmessage = async(req,res)=>{
    const groupid = req.params.groupid;
    console.log("groupid",groupid);
    const findgroup = await group.findOne({_id:groupid})
    .populate({
        path: "admin",
  
        populate: {
          path: "profileimage",
          select: "profileimage",
        },
      })
      .populate({
        path: "members.membersid",
      })
      .populate({
        path: "messages.sender",
  
        populate: {
          path: "profileimage",
          select: "profileimage",
        },
      })
    res.send(findgroup)
    res.end()
}

////////////////////////////////  GET USER GROUPS ////////////////////////

const usergroups = async (req,res)=>{
  const getgroup = await group.find({
    $or: [
      { adminnumber: req.user.number },
      { 'members.number': req.user.number }
    ]
  })
  console.log("groups",getgroup )
  res.status(200).json({status:true,message:"getd all groups",data:getgroup})

}

/////////////////////////  DELETE GROUP MESSAGE ////////////////////////
const deletemessage = async (req,res)=>{
  console.log("req.user,id",req.params)
  const findegroup = await group.findOne({_id:req.params.id})
  console.log("findegroup",findegroup)
  if(!findegroup){
    return res.status(400).json({status:false,message:"group not found"})
  }

 findegroup.messages = findegroup?.messages.filter((item)=>item._id.toString() !== req.params._id)

  findegroup.save()
  console.log("deletemessage",deletemessage)
res.status(200).json({status:true,message:"message deleted"})
}


/////////////////////////////// START GROUP MESSAGE ///////////////////////////

const stargroupemessage =async (req,res)=>{

 const findegroup = await group.findOne({_id:req.params.id})

 if(!findegroup){
  return res.status(400).json({status:false,message:"group not found"})
 }

const findeandupdate = findegroup.messages?.find((item)=>item._id == req.params._id )
if(!findeandupdate){
  return res.status(400).json({status:false,message:"message not found id is incorect"})
}
 findeandupdate.star = !findeandupdate.star                
 findegroup.save()
 res.status(200).json({status:true,message:"starede succeses"})

}

module.exports = {
  creategroup,
  getgroups,
  sendmessageongroup,
  getgroupmessage,
  usergroups,
  deletemessage,
  stargroupemessage,
};
