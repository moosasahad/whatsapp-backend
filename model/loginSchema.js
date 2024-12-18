const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  number: { type: String },
  date: { type: Date, default: Date.now }, 
  about: { type: String, default: "Hey there! I am using WhatsApp." },
  profileimage: { type: String,default: "https://res.cloudinary.com/dyp3vtpwa/image/upload/v1734500090/profile/hr5wtzlk4n2s6hibyhqu.png"},
  status:{type:String,default:"pending"}
});

module.exports = mongoose.model("User", loginSchema);
     