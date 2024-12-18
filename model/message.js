
const mongoose = require('mongoose')

const sendMessageSchema = new mongoose.Schema({
    senderid: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    reciverid: { type: mongoose.Schema.ObjectId, required: true,ref: "User" },
    message: [{
        text: { type: String },
        image: { type: String },
        audio: { type: String },
        video:{ type: String },
        date:{ type: Date, default: Date.now },  
    }]
}, 
{
    timestamps: true 
});

module.exports=mongoose.model('messsage',sendMessageSchema)