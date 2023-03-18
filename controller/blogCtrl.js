const User = require('../models/userModel')
const blog = require('../models/blogModel')
const generateToken = require('../config/jwtToken')
const validateMongId = require('../utils/validateMongId')
const generateRefreshToken = require('../config/refreshToken')
const jwt = require('jsonwebtoken')
const expressAsyncHandler = require('express-async-handler')
const sendEmail = require('./emailCtrl')
const crypto = require('crypto')
const blogModel = require('../models/blogModel')
const uploadImg = require('../utils/cloudinary')



const createBlog = expressAsyncHandler(async (req, res)=>{
    
    try {
        const newBlog = await blog.create(req.body)
        res.json({
            msg:"Successfully created blog",
            newBlog
        })
    } catch (error) {
       throw new  Error(error) 
    }
})

const updateBlog = expressAsyncHandler(async (req, res)=>{
    const {id} = req.params
    validateMongId(id)
    console.log(id)
    try {
        const newBlog = await blog.findByIdAndUpdate(id, req.body, {
            new:true
        })
        res.json({
            msg:"Successfully updated blog",
            newBlog
        })
    } catch (error) {
       throw new  Error(error) 
    }
})

//get a blog
const getBlog = expressAsyncHandler(async  (req, res)=>{
    console.log("eee")
    const {id} = req.params
    validateMongId(id)
   // const findBlog = await blog.findById(id)
    const updateViews = await blog.findByIdAndUpdate(id, {
        $inc:{NumViews:1}
    }, {new:true})
    if(!updateViews) throw new Error("This blog does not exist")

    res.json(updateViews)
})

//get all blog
const getAllBlog = expressAsyncHandler(async (req, res)=>{
    const findBlog = await blog.find()
    if(!findBlog) throw new Error("This blog does not exist")

    res.json(findBlog)

})

const deleteBlog = expressAsyncHandler(async (req, res)=>{
    const {id} = req.params
    
    validateMongId(id)
    try {
       
        await blog.findByIdAndDelete(id)
        res.json({msg: "Successfully deleted"})
    } catch (error) {
        throw new Error(`Error : ${error}`)
    }
})

const likeBlog = expressAsyncHandler(async (req, res)=>{
    const {id, like} = req.body
    validateMongId(id)
   
    if(like){
        const findBlog = await blog.findById(id)
    const loginUserId = req?.user?._id
    const isLiked = findBlog?.isLiked
    console.log(isLiked)
    const alreadyDisliked =  findBlog?.Dislikes?.find(
        (userId)=>{
        console.log(userId, loginUserId);
        userId?.toString()===loginUserId?.toString()})
        console.log(alreadyDisliked, "allo"); 
    if(alreadyDisliked){
        const blg = await blog.findByIdAndUpdate(id, {
            $pull: {Dislikes:loginUserId},
            isDisliked:false
        }, {new:true})
        res.json(blg)
    }

    if(isLiked){
        const blg = await blog.findByIdAndUpdate(id, {
            $pull: {Likes:loginUserId},
            isLiked:false
        }, {new:true})
        res.json(blg)
    }else{
        const blg = await blog.findByIdAndUpdate(id, {
            $push: {Likes:loginUserId},
            isLiked:true
        }, {new:true})
        res.json(blg)
    }
    }else{
        const findBlog = await blog.findById(id)
    const loginUserId = req?.user?._id
    const isDisliked = findBlog?.isDisliked
    const alreadyLiked =  findBlog?.Likes?.find(
        (userId)=>userId?.toString()===loginUserId?.toString())
    if(alreadyLiked){
        const blg = await blog.findByIdAndUpdate(id, {
            $pull: {Likes:loginUserId},
            isLiked:false
        }, {new:true})
        res.json(blg)
    }

    if(isDisliked){
        const blg = await blog.findByIdAndUpdate(id, {
            $pull: {Dislikes:loginUserId},
            isDisliked:false
        }, {new:true})
        res.json(blg)
    }else{
        const blg = await blog.findByIdAndUpdate(id, {
            $push: {Dislikes:loginUserId},
            isDisliked:true
        }, {new:true})
        res.json(blg)
    }
    }

})

const uploadImages = expressAsyncHandler(async (req, res)=>{
    const {id} = req.params
    validateMongId(id)
    try {
        const uploader = (path)=>uploadImg(path, 'images')
        const urls = []
        const files=req.files
        console.log(req.params)
        for( const file of files){
            const {path} = file
            const newPath = await uploader(path)
            urls.push(newPath)
        }
        console.log(urls)
        const findBlog = await blogModel.findByIdAndUpdate(id, 
            {
                Images:urls.map((file)=>{
                return file
                })
            }
        , {new :true})
        res.json(findBlog)

    } catch (error) {
        throw new Error(error)
    }
   
})


module.exports = {createBlog, updateBlog,
                getBlog, getAllBlog, deleteBlog,
            likeBlog, uploadImages}