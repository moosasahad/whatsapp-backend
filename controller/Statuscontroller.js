const ContactSchema = require("../model/ContactSchema");
const Groupschema = require("../model/Groupschema");
const Status = require("../model/StatusSchema");


//////////////////////////////// CREATE A NEW STATUS //////////////////////////

const createStatus = async (req, res) => {
    const { type, content } = req.body;
    const image = req.file?.path
    console.log("type",type)
    console.log("image",image)

    if (!type ) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newStatus = new Status({
      userId: req.user.id, 
      type,
      content:type == "text" ?content:image,
    });

    const savedStatus = await newStatus.save();
    res.status(201).json({ success: true, message: "Status created successfully", data: savedStatus });
};

//////////////////////////////////// GET USER STATUS //////////////////////////////

const getUserStatuses = async (req, res) => {
  
    const statuses = await Status.find({ userId: req.user.id, expiresAt: { $gte: new Date() } }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: statuses });
 
};

/////////////////////////////// GET CONTATC STATUS ///////////////////////////

const getContactStatuses = async (req,res) => {
  console.log("12345")
  const contactid = await ContactSchema.find({userid:req.user.id})
  const profileid = contactid.filter((item) => item.profileimage.toString() !== req.user.id.toString()).map((item) => item.profileimage);
  console.log("profileid",profileid)
  console.log("contactid",req.user.id)
     
    const statuses = await Status.find({
      userId: profileid, 
      expiresAt: { $gte: new Date() },
    });

    res.status(200).json({ success: true ,data:statuses});
  
};

///////////////////////////////// DELETE STATUS ///////////////////////////

const deleteStatus = async (req, res) => {

    const { id } = req.params;
    const status = await Status.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!status) {
      return res.status(404).json({ success: false, message: "Status not found or unauthorized" });
    }
console.log("deleted status",status)
    res.status(200).json({ success: true, message: "Status deleted successfully" });
 
};



module.exports = {
  createStatus,
  getUserStatuses,
  getContactStatuses,
  deleteStatus,
};
