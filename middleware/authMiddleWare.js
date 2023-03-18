const expressAsyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')


const authMiddleWare = expressAsyncHandler(async(req, res, next)=>{
    let token
   
    if(req?.headers?.authorization?.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1]
        
        try {
            if(token){
                const decoded = jwt.verify(token, process.env.JWT_Key)
                const user = await userModel.findById(decoded?.id)
                req.user = user
                next()
            }
        } catch (error) {
            throw new Error("Authorization token invalid or expired"+error)
        }
    }else{
        throw new Error("Enter your authorization token")
    }
    
})

const isAdmin = expressAsyncHandler( async(req, res, next)=>{
    const cookie = req.cookies
    if(!cookie?.refreshToken) throw new Error("No refresh token in cookies")
    const refreshToken = cookie.refreshToken
    const idn = jwt.verify(refreshToken, process.env.JWT_Key, (err, decoded) =>{
       
        return decoded.id
    })
    
    const adminUser = await userModel.findOne({_id:idn})
    if(adminUser.Role !== "admin"){
        throw new Error("You do not have admin permissions")
    }else {
        next()
    }
})


module.exports = {authMiddleWare, isAdmin}