
const user = require('../model/loginSchema')
const contact = require('../model/ContactSchema')
const jwt = require('jsonwebtoken')

const client = require("twilio")(process.env.accoutnSID, process.env.authToken);

//---------genarate otp using phone number------------------- //

const otpgenarating = async (req, res) => {
  console.log("number", req.body);
  const { number } = req.body;
  console.log("number in db",number)

  // Validate the input
  if (!number) {
    return res.status(404).json({status:false, message: "Number not found"});
  }

  // Send OTP
  const response = await client.verify
    .services(process.env.serviceSID)
    .verifications.create({
      to: `+91${number}`,
      channel: "sms",
    });
    
  const findnumber = await user.findOne({ number: number });
  if (findnumber) {
    return res
      .status(200).json({status:true, message: "OTP sent and number added to the database",data: findnumber,otpResponse: response,  });
  }

  const addnumbertodb = new user({ number: number });
  const savenumber = await addnumbertodb.save();
  res.status(200).json({
    message: "OTP sent and number added to the database",data: savenumber,otpResponse: response,
  });
};


// ----------------------  verify otp -------------------- //

const otpverification = async (req, res) => {
  const { otp, userNumber } = req.body;
  console.log("qwert3456",{otp, userNumber});
  
  if(!otp||!userNumber){
    return res.status(404).json({message:`${otp||userNumber} is not get`})
  }

    console.log("otp ", otp);
    const userse = await user.findOne({number:userNumber})       


    console.log("userNumber",userse);

    const response = await client.verify  
      .services(process.env.serviceSID)
      .verificationChecks.create({
        to: `+91${userNumber}`,
        code: otp,
      });

      
      

    console.log("otp res", response);
    console.log("userse",userse._id);

    if (response.valid) {
      console.log("otp res", response);
    console.log("userse",userse._id);
      const usertoken = jwt.sign({id:userse._id,number:userse.number},process.env.JWT_SECRET_KEY,{ expiresIn: "30d" })

    res.cookie('token',usertoken,{
      httpOnly:true,
      secure:false,
      sameSite:"lax",
      maxAge:30*1*24*60*60*1000

    })
    console.log("usertoken",usertoken)
      res.status(200).json({ message: "Welcome verfication sucsses" , data:response, token:usertoken });
    } else {
      res.status(400).json({message: "Expired or Invalid OTP",data:response });
    }

};

// ------------------ add user details in user profile ---------------- //


const adduserdetails = async(req,res)=>{
  const {name} = req.body
  const image = req.file?.path
  const id = req.user.id
  console.log("cuurentuser",req.body)

  const userse = await user.findOne({_id:id})
  userse.name=name;
  userse.profileimage=image
  const upadteuser = await userse.save()
  console.log("cuurentuser",upadteuser)

  res.status(200).json({status:true,message:"user details sucssesfully updated",data:upadteuser})             
}


// --------------------- get all logined user profile --------------- //


const getspacificuser = async (req,res)=>{
  const userid = req.user.id;
  const userse = await user.findOne({_id:userid})
  res.status(200).json({status:true,message:"get spacifc user profile details",data:userse})
}


// ---------------- save contact details under the user --------------------- //


const savecontacts = async (req,res,)=>{
  const {name,number} = req.body;
  const findenumberuser = await user.findOne({number:number})
  if(!findenumberuser){
    return res.status(403).json({status:true,message:"this numbe not have a whatsapp acoount pleas invte",number:number})
  }
  const finduser = await contact.findOne({userid:req.user.id})
  console.log("findcontact",finduser);
  if(!finduser){
    const addcontactcollection = new contact({
      userid:req.user.id,
      contacts:[{
        name:name,
        number:number,
      profileimage:findenumberuser._id,

      }]
    })
    const savecollection = await addcontactcollection.save()
    return res.status(200).json({status:true,message:"creat a new collection and number saved.",data:savecollection})
  }else{
    console.log("hfgsdhf",finduser);
    const findenumber = finduser.contacts.find(item=>item.number==number)
    console.log("hfgsdhf",findenumber);
   
    console.log("hjdgfdgsfjhsdgfgdjgj..........",findenumberuser)
    if(findenumber){
      return res.status(403).json({status:true,message:"this number already you saved your system",number:number})
    }
    console.log("profile image ",findenumberuser._id)
     finduser.contacts.push({
      name:name,
      number:number,
      profileimage:findenumberuser._id,
    }) 
    await finduser.save();
  console.log("Contact added successfully");
  return res.status(200).json({status: true,message: "Contact added successfully",contact: { name, number }});

}

}


// ------------------------- get all contacts --------------------- //


const getallcontacts = async (req,res)=>{
  const contatctes = await contact.findOne({userid:req.user.id}).populate("contacts.profileimage",'profileimage');
  console.log("mesage",contatctes);
  
  res.status(200).json({status:true,message:"get all contatcs",data:contatctes})
}

module.exports ={
  otpgenarating,
  otpverification,
  adduserdetails,
  savecontacts,
  getallcontacts,
  getspacificuser,
};
