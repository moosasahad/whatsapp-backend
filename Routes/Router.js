const express = require('express')
const  logincontroller = require('../controller/logincontroller')
const messagecontroller = require('../controller/Messagecontroller')
const trycatch = require('../midilware/TryCatch')
const Authmidilware = require('../midilware/Authantication')
const router = express.Router()
const upload = require("../midilware/Fileuploadingmidilware")
const messagefile = require('../midilware/messagefileupload')

router

    // --------------- login controller ---------------- //

    .post('/',trycatch(logincontroller.otpgenarating))  
    .post('/send-otp',trycatch(logincontroller.otpverification))
    .post('/adduserdetails',Authmidilware,upload.single('image'),trycatch(logincontroller.adduserdetails))
    .post('/savecontact',Authmidilware,trycatch(logincontroller.savecontacts))
    .get('/getallcontatc',Authmidilware,trycatch(logincontroller.getallcontacts))
    .get('/getspacificuser',Authmidilware,trycatch(logincontroller.getspacificuser))

    //  ------------------------- message controller ----------------- //

    .post('/sendmessage', Authmidilware,messagefile.single('files'),trycatch(messagecontroller.message))
    .get('/getmessaeg/:reciverid', Authmidilware,trycatch(messagecontroller.getmessages))
    .get('/getallmessagers', Authmidilware,trycatch(messagecontroller.messagesenders))






module.exports=router