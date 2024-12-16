const express = require('express')
const  logincontroller = require('../controller/logincontroller')
const trycatch = require('../midilware/TryCatch')
const Authmidilware = require('../midilware/Authantication')
const router = express.Router()

router

    .post('/',trycatch(logincontroller.otpgenarating))  
    .post('/send-otp',trycatch(logincontroller.otpverification))
    .post('/adduserdetails',Authmidilware,trycatch(logincontroller.adduserdetails))
    .post('/savecontact',Authmidilware,trycatch(logincontroller.savecontacts))
    .get('/getallcontatc',Authmidilware,trycatch(logincontroller.getallcontacts))


module.exports=router