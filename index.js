require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const router = require('./Routes/Router')
const cookieparse = require('cookie-parser')
const app = express()
app.use(express.json())
app.use(cookieparse())
app.use(router)

mongoose.connect(process.env.CONECTTIN_URL,
    {
        serverSelectionTimeoutMS: 30000,      
      })
      .then(() => {
        console.log("Connected to MongoDB");
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error);
      });


app.listen(process.env.PORT,()=>{
    console.log('server runned at ',process.env.PORT)
})
