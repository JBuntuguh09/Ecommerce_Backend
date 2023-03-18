const User = require('../models/userModel')
const asyncHandler = require('express-async-handler')
const generateToken = require('../config/jwtToken')
const validateMongId = require('../utils/validateMongId')
const generateRefreshToken = require('../config/refreshToken')
const jwt = require('jsonwebtoken')
const expressAsyncHandler = require('express-async-handler')
const { findOne, findById } = require('../models/userModel')
const sendEmail = require('./emailCtrl')
const crypto = require('crypto')
const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const userModel = require('../models/userModel')
const orderModel = require('../models/orderModel')
const uniqid = require('uniqid')
const { now } = require('mongoose')



const createUser = asyncHandler(async (req, res)=>{
    const email = req.body.Email
    
    const findUsers = await User.findOne({Email:email})
    console.log(findUsers)
    if(!findUsers){
        //create user
       
        const newUser = await User.create(req.body)
        res.json(newUser)
    }else{
        //user already exist
       throw new Error("User already exist")

    }
})

//login
const loginUser = asyncHandler (async (req, res)=>{
    const{ Email, Password} = req.body
    
    //const findUser = await User.findOne({email})
    const findUser = await User.findOne({Email: Email})
    
    if(findUser && (await findUser.isPasswordMatched(Password))){
        
        const refreshToken = await generateRefreshToken(findUser?._id)
        const updateUser = await User.findByIdAndUpdate(
            findUser.id,
            {
                refreshToken:refreshToken
            },
            { new : true }
        )
        res.cookie("refreshToken", refreshToken, {
            httpOnly:true,
            maxAge: 24*60*60*1000
        })
        
        res.json(
            {
                User_Id : findUser?._id,
                First_Name : findUser?.First_Name,
                Last_Name : findUser?.Last_Name,
                Phone : findUser?.Mobile,
                Email : findUser?.Email,
                Token : generateToken(findUser?._id)
            
            
            }

        )
    }else{
        throw new Error("Invalid Credentials")
    }
})

//loginAdmin
const loginAdmin = asyncHandler (async (req, res)=>{
    const{ Email, Password} = req.body
    
    //const findUser = await User.findOne({email})
    const findUser = await User.findOne({Email: Email})
    
    if(findUser && (await findUser.isPasswordMatched(Password))){
        
        const refreshToken = await generateRefreshToken(findUser?._id)
        const updateUser = await User.findByIdAndUpdate(
            findUser.id,
            {
                refreshToken:refreshToken
            },
            { new : true }
        )
        res.cookie("refreshToken", refreshToken, {
            httpOnly:true,
            maxAge: 24*60*60*1000
        })
        
        res.json(
            {
                User_Id : findUser?._id,
                First_Name : findUser?.First_Name,
                Last_Name : findUser?.Last_Name,
                Phone : findUser?.Mobile,
                Email : findUser?.Email,
                Token : generateToken(findUser?._id)
            
            
            }

        )
    }else{
        throw new Error("Invalid Credentials")
    }
})

//handle Refresh Token

const handleRefreshToken = asyncHandler(async (req, res)=>{
    const cookie = req.cookies
    if(!cookie?.refreshToken) throw new Error("No refresh token in cookies")
    const refreshToken = cookie.refreshToken
    const idn = jwt.verify(refreshToken, process.env.JWT_Key, (err, decoded) =>{
       
        return decoded.id
    })
    const user = await User.findById({_id:idn})
    
    if(!user) throw new Error("No refresh token present in db or does not match")
    jwt.verify(refreshToken, process.env.JWT_Key, (err, decoded) =>{
       
        if(err || user.id!==decoded.id){
        throw new Error("There is an error in refresh token")
    }
    const accessToken = generateToken(user?._id)
   res.json({accessToken})
})
    
    
})

//getAllUsers
const getAllUser = asyncHandler( async (req, res)=>{
    try {
        const findUsers = await User.find()
        res.json(findUsers)
    } catch (error) {
        throw new Error("No users found")
    }
})
//get user
const getUser = asyncHandler(async (req, res)=>{
    
    const {id} = req.params
    validateMongId(id) 
    try{
        const findUser = await User.findById(id)
        res.json({findUser})
    }catch(error){
        throw new Error("No user found")
    }
})

//update user
const updateUser = asyncHandler( async (req, res)=>{
   
    const { id } = req.params
    validateMongId(id) 
    try {
        const updateUser = await User.findByIdAndUpdate(id, {
            Firstname:req?.body?.First_Name,
            Lastname : req?.body?.Last_Name,
            Email : req?.body?.Email,
            Password : req?.body?.Password,
            Phone : req?.body?.Mobile
            
        }, { new :true })
        res.json({
           updateUser
        })
    } catch (error) {
        throw new Error("This user is invalid")
    }
})


//deleteUser

const deleteUser = asyncHandler( async (req, res)=>{
    const { id } = req.params
    validateMongId(id) 
        
    try {
       const delUser = await User.findByIdAndDelete(id)
        res.json({
           delUser
        }) 
    } catch (error) {
        throw new Error("This user is invalid")
    }
})

//block user

const blockUser = asyncHandler( async (req, res)=>{
    const { id } = req.params
     validateMongId(id)   
    try {
        const block = await User.findByIdAndUpdate(id, {
            isBlocked:true
        }, { new:true })
        res.json({
            block
        })
    } catch (error) {
        throw new Error("This user is invalid")
    }
})

const unblockUser = asyncHandler( async (req, res)=>{
    const { id } = req.params
    validateMongId(id) 
    try {
        const block = await User.findByIdAndUpdate(id, {
            isBlocked:false
    }, { new : true })
    res.json({
        block
    })
    } catch (error) {
        throw new Error("This user is invalid")
    }
})

//logout
const logout= asyncHandler(async (req, res)=>{
    const cookie = req.cookies
    if(!cookie?.refreshToken) throw new Error("You are already logged out")
    const refreshToken = cookie.refreshToken
    const idn = jwt.verify(refreshToken, process.env.JWT_Key, (err, decoded) =>{
       
        return decoded.id
    })
    const user = await User.findById({_id:idn})
    if(!user){
        res.clearCookie("refreshToken", {
            httpOnly:true,
            secure:true
        });
        return res.status(204)
    }

    await User.findByIdAndUpdate({_id:idn}, {
        refreshToken:""
    })
    res.clearCookie("refreshToken", {
        httpOnly:true,
        secure:true
    })
     res.sendStatus(204)
})

//update password
const updatePassword = expressAsyncHandler (async (req, res) =>{
    const {_id} = req.user
    
    const {Password} = req.body
    validateMongId(_id)
    console.log(Password)
    const user = await User.findById(_id)
    if(Password){
        user.Password = Password
        const updtPass = await user.save()
        res.json(updtPass)
    }else{
        res.json(user)
    }
})

const forgotPasswordToken = expressAsyncHandler(async (req, res) =>{
    const {Email} = req.body
    
    const user = await User.findOne({Email:Email})
   
    if(!user) throw new Error("This user does not exist")
    try {
        const token = await user.createPasswordResetToken()
        await user.save()
        const resetUrl = "Hello, Please follow this link to reset your password. This link is valid for 10minutes "+
         "<a href='http://localhost.5000/api/user/resetPassword/'>Click Here</a>"
         const data = {
            to:Email,
            text: "How be",
            subject:"Forgot password",
            htm: resetUrl
         }
         sendEmail(data)

         res.json(token)
    } catch (error) {
        res.json(error)
    }
})

const resetPassword = expressAsyncHandler(async (req, res)=>{
    const {Password} = req.body
    
    const token = req.params
   
    const hashedToken = crypto.createHash("sha256").update(token.token).digest('hex')
    const user = await User.findOne({
        PasswordResetToken:hashedToken,
        PasswordResetExpires:{$gt:Date.now()}
    })
    if(!user) throw new Error("Token expired. Please try again later")
    user.Password = Password
    user.PasswordResetToken = undefined
    user.PasswordResetExpires = undefined
    
    await user.save()
    res.json(user)
})

const getWishList= asyncHandler(async(req, res)=>{
    const {id} = req.params
    validateMongId(id)
    try {
        const findUser = await User.findById(id).populate("Wish_List")
        const wishList = findUser.Wish_List

        res.json(findUser)
    } catch (error) {
        throw new Error(error)
    }
})

const saveAddress= expressAsyncHandler(async (req, res)=>{
    const {id} = req.params
    validateMongId(id)
    try {
        const updateUser = await User.findByIdAndUpdate(id, {
            Address: req.body?.Address
        }, {new :true})

        res.json(updateUser)
    } catch (error) {
        throw new Error(error)
    }
})

const userCart = expressAsyncHandler( async (req, res)=>{
    const {Cart} = req.body

    const {_id} = req.user
    validateMongId(_id)

    try {
        let products= []
        const findUser = await User.findById(_id)
        const alreadyExist = cartModel.findOne({OrderBy:findUser._id})
        if(alreadyExist){
            alreadyExist.remove()
        }

        for(let i=0; i<Cart.length; i++){
            let object = {}
            object.Product = Cart[i]._id
            object.Count = Cart[i].Count
            object.Color = Cart[i].Color
            let getPrice = await productModel.findById(Cart[i]._id).select("Price").exec()
            object.Price = getPrice.Price
            products.push(object)

            
        }
        let cartTotal = 0
        for(let a=0; a<products.length; a++){
            cartTotal= cartTotal+products[a].Price * products[a].Count
        }
        let newCart = await new cartModel({
            Products:products,
            CartTotal:cartTotal,
            OrderBy:findUser._id
        }).save()

        res.json(newCart)
       
    } catch (error) {
        throw new Error(error)
    }
})

const emptyUserCart = expressAsyncHandler(async (req, res)=>{
    const {_id} = req.user
    validateMongId(_id)
    console.log(_id)
    try {
        const user = await userModel.findOne({_id})
        const cart = await cartModel.findOneAndRemove({OrderBy:user._id}, {new:true})
        
        if(cart==null){
            res.json({msg:"Cart is already empty"})
        }else{
            res.json({msg:"Successully deleted"})
        }
        
    } catch (error) {
        throw new Error(error)
    }
})

const getUserCart = expressAsyncHandler(async (req, res)=>{
    const {_id} = req.user
    validateMongId(_id)
    console.log(_id)
    try {
        const cart = await cartModel.find({OrderBy:_id}).populate("OrderBy")
        res.json(cart)
    } catch (error) {
        throw new Error(error)
    }
})

const createOrder = expressAsyncHandler(async (req, res)=>{
    const {COD, couponApplied } = req.body
    const {_id} = req.user
    try {
        if(!COD) throw new Error("Create Cash oder failed")
        const user = await userModel.findById(_id)
        const cart = await cartModel.findOne({OrderBy:user._id})
        let finalAmount = 0
        if(couponApplied && cart.TotalAfterDiscount){
            finalAmount = cart.TotalAfterDiscount 
        }else {
            finalAmount = cart.CartTotal 
        }
        let newOrder = await new orderModel({
            Products:cart.Products,
            PaymentIntent:{
                id:uniqid(),
                Method:"Cod",
                Amount:finalAmount,
                Status:"Case on Demand",
                Created: now(),
                Currency:"GHC"
            },
            OrderBy:user._id,
            OrderStatus:"Cash on Delivery",
        }).save()

        let update = cart.Products.map((item)=> {
            return{
                updateOne:{
                    filter:{_id : item.Product._id},
                    update:{
                       $inc:{ Quantity:item.Count, Sold:+item.Count} 
                    }
                }
            }
        })

        const updated = await productModel.bulkWrite(update, {})

        res.json({msg:"Success"})
    } catch (error) {
        throw new Error(error)
    }
})


const getOrders= expressAsyncHandler(async (req, res)=>{
    const {_id} = req.user
    validateMongId(_id)
    try {
        const userOders = await orderModel.findOne({OrderBy:_id}).populate("Products.Product")
        res.json(userOders)
    } catch (error) {
        throw new Error(error)
    }
})

const updateOrderStatus= expressAsyncHandler(async (req, res)=>{
    const {id} = req.params
    const  { Status } = req.body
    console.log( id)

    validateMongId(id)
    try {
        const order = await orderModel.findByIdAndUpdate(id, {
            OrderStatus:Status,
            PaymentIntent:{
                Status:Status
            }
        }, {new :true})
        res.json(order)
    } catch (error) {
        throw new Error(error)
    }
})



module.exports = {
    createUser, loginUser, 
    getAllUser, getUser,
    updateUser, deleteUser,
    blockUser, unblockUser,
    handleRefreshToken, logout,
    updatePassword, forgotPasswordToken,
    resetPassword, getWishList,
    userCart, getUserCart, emptyUserCart,
    createOrder, getOrders, updateOrderStatus
}
