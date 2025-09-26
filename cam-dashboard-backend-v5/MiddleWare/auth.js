import jwt from 'jsonwebtoken'

export function authMiddleWare(req, res ,next){
    const token = req.headers['authorization']
    if(!token){
        console.log("NOT FOUND")
        return res.status(401).json({message:"No token Provided"})
    }
    jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
        if(err){
            return res.status(401).json({message:"Invalid Token"})
         }
        req.userId = decoded.id
        next()
    })
}
