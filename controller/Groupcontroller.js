const group = require("../model/Groupschema");
const contact = require("../model/ContactSchema");
const user = require("../model/loginSchema");
const path = require('path');
const { findOne } = require("../model/message");

// ----------------------- creating group -------------------- \\
const creategroup = async (req, res) => {

  const { groupName, members } = req.body;
  const image = req.file?.path;
// console.log("groupName, members",groupName, members)
// console.log("image",image)

const parsedMembers = typeof members === "string" ? JSON.parse(members) : members;
// console.log("parsedMembers",parsedMembers)

if (!Array.isArray(parsedMembers)) {
    return res.status(400).json({ error: "Members must be an array" });
  }

  const newgroup = new group({
    groupName:groupName,
    groupImage: image,
    adminnumber: req.user.number,
    members: parsedMembers.map((item) => ({
      membersid: item.membersid,
      number: item.number,
    })),
    admin: req.user.id,
  });

  const savedGroup = await newgroup.save();
  res.status(200).json({ status: true, message: "Group created", data: savedGroup });
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
  const io = req.app.get("io");

  const { groupid, message } = req.body;
  // console.log("message",req.body)

  let audios;
  let videos;
  let images;

  const files = req.file?.path;
  // console.log("imagefile", files);

  if (files) {
    const fileExtension = path.extname(files).toLowerCase();
    // console.log("File extension:", fileExtension, files);

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
  // console.log("findgroup",findgroup)
   findgroup.messages.push({
    sender:req.user.id,
    sendernumber:req.user.number,
    text: message,
    image: images,
    audio: audios,
    video: videos,
})
await findgroup.save();
const updatedGroup = await group
      .findById(groupid)
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
      });


   
 console.log(updatedGroup)
  io.emit("res-group-message",updatedGroup)
 
 
  res.status(200).json({status:true,message:"message sended",data:updatedGroup})
};


// ------------------------- get spacfic group message ---------------------------------- ///


const getgroupmessage = async(req,res)=>{
  const io = req.app.get("io");

    const groupid = req.params.groupid;
    // console.log("groupid",groupid);
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
      io.emit("get-message",findgroup)
    res.status(200).json({message:'get group messsage',findgroup})
}

////////////////////////////////  GET USER GROUPS ////////////////////////

const usergroups = async (req,res)=>{
  const getgroup = await group.find({
    $or: [
      { adminnumber: req.user.number },
      { 'members.number': req.user.number }
    ]
  })
  // console.log("groups",getgroup )
  res.status(200).json({status:true,message:"getd all groups",data:getgroup})

}

/////////////////////////  DELETE GROUP MESSAGE ////////////////////////
const deletemessage = async (req,res)=>{
  // console.log("req.user,id",req.params)
  const findegroup = await group.findOne({_id:req.params.id})
  // console.log("findegroup",findegroup)
  if(!findegroup){
    return res.status(400).json({status:false,message:"group not found"})
  }

 findegroup.messages = findegroup?.messages.filter((item)=>item._id.toString() !== req.params._id)

  findegroup.save()
  // console.log("deletemessage",deletemessage)
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

  ////////////////////// ADD MEMBERSE IN EXISTING GROUP ///////////////////////////////////

  const addmembersingroup =async (req,res) => {
    const groupid = req.params._id;
    const membersid = req.params.id;
    // console.log("groupid",groupid)
    // console.log("membersid",membersid)
    const number =await contact.findOne({profileimage:membersid,userid:req.user.id});
    // console.log("number",number)
    if(!number){
      return res.status(400).json({status:false,messsage:"number not saved"})
    }
    const findgroup = await group.findOne({_id:groupid})
    const exitingmember = findgroup.members.find((item)=>item.membersid == membersid )
    // console.log("exitingmember",exitingmember)
    if(exitingmember){
      return res.status(400).json({status:false,message:"this contact alredy this group"})
    }
  

    findgroup.members.push({
      membersid: membersid,
    number: number.number,
    })
    findgroup.save()
res.status(200).json({status:false,message:"contact saved",data:findgroup})
  }

/////////////////////// EXIT GROUP ////////////////////////
  const exitgroup = async (req,res)=>{
    const findegroup = await group.findOne({_id:req.params.id})
    if(!findegroup){
      res.status(400).json({messaeg:"group not found"})
    }
    const updatedMembers = findegroup?.members.filter((item)=>item.membersid.toString() !== req.user.id)
    console.log(updatedMembers,req.user.id)
    findegroup.members = updatedMembers 
    await findegroup.save()
    res.status(200).json({message:"your exiting this group",findegroup})
  
  }

module.exports = {
  creategroup,  
  getgroups,
  sendmessageongroup,
  getgroupmessage,
  usergroups,
  deletemessage,
  stargroupemessage,
  addmembersingroup,
  exitgroup,
};
