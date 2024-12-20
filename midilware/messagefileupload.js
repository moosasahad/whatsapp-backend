const multer = require("multer")
const {CloudinaryStorage} = require("multer-storage-cloudinary")
const cloudinary = require("cloudinary").v2

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "messagefile",
        allowed_formats: ["jpg", "png", "jpeg", "mp4", "mp3", "aac", "wav", "WebM"],
        resource_type: "auto",  // Ensure this is set correctly
    },
});


const messageupload = multer({storage:storage})

module.exports=messageupload
