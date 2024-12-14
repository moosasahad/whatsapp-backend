const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  number: { type: String },
  date: { type: Date, default: Date.now }, 
  about: { type: String, default: "Hey there! I am using WhatsApp." },
  profileimage: { type: String,default: "default-profile.png"},
  status:{type:String,default:"pending"}
});

module.exports = mongoose.model("User", loginSchema);
