const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true,required: true }, 
    groupImage: { type: String,default: "https://res.cloudinary.com/dyp3vtpwa/image/upload/v1734500090/profile/hr5wtzlk4n2s6hibyhqu.png"}, 
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    adminnumber:{type: String, required: true },
    members: [{
      membersid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
      },
      number:{type: String, required: true },
    }
       
    ], 
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
        sendernumber:{type: String, required: true },
        text: { type: String },
        image: { type: String },
        audio: { type: String },    
        video:{ type: String },
        star:{type:Boolean,default:false},
        date:{ type: Date, default: Date.now } 
      },
    ], 
    status:{type:String,default:"group"},
  },
  { timestamps: true }
);



module.exports = mongoose.model('Group', groupSchema);
