const express = require('express')
const  logincontroller = require('../controller/logincontroller')
const messagecontroller = require('../controller/Messagecontroller')
const trycatch = require('../midilware/TryCatch')
const Authmidilware = require('../midilware/Authantication')
const router = express.Router()
const upload = require("../midilware/Fileuploadingmidilware")
const messagefile = require('../midilware/messagefileupload')
const Groupcontroller = require("../controller/Groupcontroller")
const Statuscontroller = require("../controller/Statuscontroller")

router

    // --------------- login controller ---------------- //

    .post('/',trycatch(logincontroller.otpgenarating))  
    .post('/send-otp',trycatch(logincontroller.otpverification))
    .post('/logout',Authmidilware,trycatch(logincontroller.logout))
    .patch('/adduserdetails',Authmidilware,upload.single('image'),trycatch(logincontroller.adduserdetails))
    .post('/savecontact',Authmidilware,trycatch(logincontroller.savecontacts))
    .get('/getallcontatc',Authmidilware,trycatch(logincontroller.getallcontacts))
    .get('/getspacificuser',Authmidilware,trycatch(logincontroller.getspacificuser))
    .patch('/updateprofile',Authmidilware,upload.single('image'),trycatch(logincontroller.updateprofile))


    //  ------------------------- message controller ----------------- //

    .post('/sendmessage', Authmidilware,messagefile.single('files'),trycatch(messagecontroller.message))
    .get('/getmessaeg/:id', Authmidilware,trycatch(messagecontroller.getmessages))
    .get('/getallmessagers', Authmidilware,trycatch(messagecontroller.messagesenders))
    .get('/searchcontatcs', Authmidilware,trycatch(messagecontroller.searchcontatcs))       
    .delete('/deletemessage/:id', Authmidilware,trycatch(messagecontroller.deletemessage)) 
    .patch('/starmessages/:id', Authmidilware,trycatch(messagecontroller.starmessages)) 
    .get('/getChatData', Authmidilware,trycatch(messagecontroller.getChatData))       







    // ---------------------------- group --------------------- //

    .post('/creategroup',Authmidilware,upload.single('image'),trycatch(Groupcontroller.creategroup ))
    .get('/getgroup',Authmidilware,trycatch(Groupcontroller.getgroups ))
    .post('/sendmessageongroup', Authmidilware,messagefile.single('files'),trycatch(Groupcontroller.sendmessageongroup))
    .get('/getgroupmessage/:groupid',Authmidilware,trycatch(Groupcontroller.getgroupmessage))
    .get("/usergroups", Authmidilware,trycatch(Groupcontroller.usergroups))
    .delete("/deletemessagegroupmessage/:id/:_id", Authmidilware,trycatch(Groupcontroller.deletemessage))
    .patch("/stargroupemessage/:id/:_id", Authmidilware,trycatch(Groupcontroller.stargroupemessage))
    .patch("/addmembersingroup/:id/:_id", Authmidilware,trycatch(Groupcontroller.addmembersingroup))


/////////////////////// STATUS /////////////////////////

    .post("/createStatus",Authmidilware,messagefile.single('files'),trycatch(Statuscontroller.createStatus))
    .get("/getUserStatuses",Authmidilware,trycatch(Statuscontroller.getUserStatuses))
    .get("/getContactStatuses",Authmidilware,trycatch(Statuscontroller.getContactStatuses))
    .delete("/deleteStatus/:id",Authmidilware,trycatch(Statuscontroller.deleteStatus))









module.exports=router