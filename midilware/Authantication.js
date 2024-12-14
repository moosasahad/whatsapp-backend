
const jwt = require('jsonwebtoken')

const Authmidilware = async(req,res,next)=>{
    try{
        const tokene = req.cookies.token;
    console.log("tokene,tokene",tokene)
    if(!tokene){
        return res.status(404).json({message:"Authentication token missing"}) 
    }
    if(tokene){
    jwt.verify(tokene, process.env.JWT_SECRET_KEY, (error, user) => {
          
        if(error){
            res.status(404).json({status:false,message:"token error",response:error})
        }else{            
            req.user=user
            console.log('Authmidilware,userdata',req.user);
            next()
        }
    });
} else {

res.status(404).json({status:false,message:"some issues not authenticated"})
}
    }catch(error)
{
    console.log("Authmidilwareerror",error)
}}

module.exports=Authmidilware