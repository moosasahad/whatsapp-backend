const mongoose = require("mongoose");

const sendMessageSchema = new mongoose.Schema(
  {
    senderid: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    reciverid: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    star: {type:Boolean,default:false,},
    text: { type: String },
    image: { type: String },
    audio: { type: String },
    video: { type: String },
    date: { type: Date, default: Date.now},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("messsage", sendMessageSchema);

// const mongoose = require("mongoose");

// const messageSchema = new mongoose.Schema({
//   senderId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
//   receiverId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
//   text: { type: String },
//   timestamp: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Message", messageSchema);
