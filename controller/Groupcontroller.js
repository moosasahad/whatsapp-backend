const group = require("../model/Groupschema");
const contact = require("../model/ContactSchema");
const user = require("../model/loginSchema");
const path = require('path')

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
    admin: req.user.contactid,
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
  console.log("message",message)

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
    sender:req.user.contactid,
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

/////////////////////////  get spacific groups ////////////////////////

module.exports = {
  creategroup,
  getgroups,
  sendmessageongroup,
  getgroupmessage,
  usergroups,
};
