const express = require('express')
const  logincontroller = require('../controller/logincontroller')
const trycatch = require('../midilware/TryCatch')
const Authmidilware = require('../midilware/Authantication')
const router = express.Router()

router

    .post('/',trycatch(logincontroller.otpgenarating))  
    .post('/send-otp',trycatch(logincontroller.otpverification))
    .post('/userdetails',Authmidilware,trycatch(logincontroller.adduserdetails))
module.exports=router