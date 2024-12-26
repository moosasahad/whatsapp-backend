const express = require('express')
const  logincontroller = require('../controller/logincontroller')
const messagecontroller = require('../controller/Messagecontroller')
const trycatch = require('../midilware/TryCatch')
const Authmidilware = require('../midilware/Authantication')
const router = express.Router()
const upload = require("../midilware/Fileuploadingmidilware")
const messagefile = require('../midilware/messagefileupload')
const Groupcontroller = require("../controller/Groupcontroller")

router

    // --------------- login controller ---------------- //

    .post('/',trycatch(logincontroller.otpgenarating))  
    .post('/send-otp',trycatch(logincontroller.otpverification))
    .post('/logout',Authmidilware,trycatch(logincontroller.logout))
    .post('/adduserdetails',Authmidilware,upload.single('image'),trycatch(logincontroller.adduserdetails))
    .post('/savecontact',Authmidilware,trycatch(logincontroller.savecontacts))
    .get('/getallcontatc',Authmidilware,trycatch(logincontroller.getallcontacts))
    .get('/getspacificuser',Authmidilware,trycatch(logincontroller.getspacificuser))
    .post('/updateprofile',Authmidilware,trycatch(logincontroller.updateprofile))


    //  ------------------------- message controller ----------------- //

    .post('/sendmessage', Authmidilware,messagefile.single('files'),trycatch(messagecontroller.message))
    .get('/getmessaeg/:recivernumber', Authmidilware,trycatch(messagecontroller.getmessages))
    .get('/getallmessagers', Authmidilware,trycatch(messagecontroller.messagesenders))
    .get('/searchcontatcs', Authmidilware,trycatch(messagecontroller.searchcontatcs))       
    .delete('/deletemessage/:id', Authmidilware,trycatch(messagecontroller.deletemessage))       



    // ---------------------------- group --------------------- //

    .post('/creategroup',Authmidilware,trycatch(Groupcontroller.creategroup ))
    .get('/getgroup',Authmidilware,trycatch(Groupcontroller.getgroups ))
    .post('/sendmessageongroup', Authmidilware,messagefile.single('files'),trycatch(Groupcontroller.sendmessageongroup))
    .get('/getgroupmessage/:groupid',Authmidilware,trycatch(Groupcontroller.getgroupmessage))
    .get("/usergroups", Authmidilware,trycatch(Groupcontroller.usergroups))








module.exports=router