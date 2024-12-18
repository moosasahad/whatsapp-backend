const mongoose = require('mongoose')

const contactSchema = new mongoose.Schema({
    userid:{type:mongoose.Schema.ObjectId,ref:"User",required:true},
    contacts:[{
        name:{type:String,required:true},
        number:{type:String,required:true},
        profileimage:{type:mongoose.Schema.ObjectId,ref:"User",required:true}
    }]
})
module.exports=mongoose.model("contacts",contactSchema)