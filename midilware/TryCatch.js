const trycatch = (fun) =>async(req,res,next)=>{
    try {
        await fun(req,res,next)
    } catch (error) {
        console.log(error)
        next(error)
    }
}
module.exports=trycatch