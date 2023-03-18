const Product = require('../models/productModel')
const asyncHandler = require('express-async-handler')
const validateMongId = require('../utils/validateMongId')
const { default: slugify } = require('slugify')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const uploadImg = require('../utils/cloudinary')
const fs = require('fs')


const createProduct = asyncHandler(async(req, res)=>{

    try {
        if(req.body.Title){
            req.body.Slug = slugify(req.body.Title)
        }
        //create product
        const newProd = await Product.create(req.body)
        res.json(newProd)
    } catch (error) {
        throw new Error(`Error : ${error}`)
    }
    
})

const getProduct = asyncHandler(async (req, res)=>{
    const {id} = req.params
    validateMongId(id)
    const findProduct = await Product.findById(id)
    if(findProduct){
        res.json(findProduct)
    }else{
        throw new Error("No product found")
    }
})

const getAllProduct = asyncHandler(async (req, res)=>{
    //filtering
    const queryObj = { ...req.query}
    const excludeFields = ["page", "sort", "limit", "fields"]
    excludeFields.forEach((el)=> delete queryObj[el])
    let queryStr = JSON.stringify(queryObj)
    queryStr  = queryStr.replace(/\b(gte|gt|lte)\b/g, (match)=> `$${match}`)
    

    let findProducts = await Product.find(JSON.parse(queryStr));

    
    try {
       //sorting
    if(req.query.sort){
    
        const sortBy = req.query.sort.split(",").join(" ")
        findProducts = await Product.find(JSON.parse(queryStr)).sort(sortBy)
    }else{
        findProducts = await Product.find(JSON.parse(queryStr)).sort("-createdAt")
    }

    //limiting the fields
    if(req.query.fields){
        console.log(req.query.field)
        const fields = req.query.fields.split(",").join(" ")
        
        findProducts = await Product.find(JSON.parse(queryStr)).select(fields)
    }else{
        
        findProducts = await Product.find(JSON.parse(queryStr)).select("-__V")
    }

    //Pagination
    const page = req.query.page
    const limit = req.query.limit
    const skip=(page-1) * limit 
    console.log(page, limit, skip)
    findProducts = await Product.find(JSON.parse(queryStr)).skip(skip).limit(limit)
    if(req.query.page){
        const productCount = await Product.countDocuments()
        if(skip>=productCount) throw new Error("This page does not exist")
    }

    if(findProducts){
        res.json(findProducts)
    }else{
        throw new Error("No products found")
    } 
    } catch (error) {
        throw new Error(error)
    }
})

  //update product
const updateProduct = asyncHandler(async(req, res)=>{
    const {id} = req.params
    validateMongId(id)
    try {
        if(req.body.Title){
            req.body.Slug = slugify(req.body.Title)
        }
      
        const newProd = await Product.findByIdAndUpdate({_id:id}, req.body, {
            new:true
        })
        res.json(newProd)
    } catch (error) {
        throw new Error(`Error : ${error}`)
    }
    
})

 //delete product
const deleteProduct = asyncHandler(async(req, res)=>{
    const {id} = req.params
    validateMongId(id)
    try {
       
        await Product.findByIdAndDelete({_id:id})
        res.json({msg: "Successfully deleted"})
    } catch (error) {
        throw new Error(`Error : ${error}`)
    }
    
})

//add to wishlist
const addToWishList = asyncHandler(async(req, res)=>{
    const {_id} = req.user
    const {prodId} = req.body

    validateMongId(_id)
    try {
       const user= await userModel.findById(_id)
       const alreadyAdded =  user.Wish_List.find((id)=>id?.toString()===prodId?.toString())
       if(alreadyAdded){
            let user = await userModel.findByIdAndUpdate(_id, 
                {
                $pull:{Wish_List: prodId}
            }, {new:true})
            res.json(user)
       }else{
        let user = await userModel.findByIdAndUpdate(_id, 
            {
            $push:{Wish_List: prodId}
        }, {new:true})
        res.json(user)
       }
       
    } catch (error) {
        throw new Error(`Error : ${error}`)
    }
    
})

const rateProduct = asyncHandler(async(req, res)=>{
    const {_id} = req.user
    const { star, prodId, comment} = req.body
    validateMongId(_id)

    try {
        const product = await productModel.findById(prodId)
    let alreadyRated = false
     let ar 
     product.Ratings.find((userId)=>{
        if(userId?.PostedBy?.toString()===_id.toString()) {alreadyRated=true 
            ar=userId
        }
        userId?.PostedBy?.toString()===_id.toString()})
        
    if(alreadyRated){
        const updateRating = await productModel.updateOne({
            Ratings : {$elemMatch:ar},
        },
        {
            $set:{"Ratings.$.Star":star, "Ratings.$.Comment":comment}
        }, {new:true}
        )
       // res.json(updateRating)
    }else{
        console.log("here")
        const rateProd = await productModel.findByIdAndUpdate(prodId, {
            $push:{
                Ratings:{
                    Star: star,
                    Comment:comment,
                    PostedBy:_id,
                    
                }
            }
        }, {new : true})
     // res.json(rateProd)  
    }
    } catch (error) {
        throw new Error(error)
    }

    const getAllRatings = await productModel.findById(prodId)
    let totalRatings = getAllRatings.Ratings.length
    let sumRatings = getAllRatings.Ratings.map((val)=>val.Star)
    .reduce((prev, curr)=>prev + curr, 0)
    let actualRating  = Math.round(sumRatings/totalRatings)
    let fRating = await productModel.findByIdAndUpdate(prodId, {
        TotalRating : actualRating
    }, {new:true})
    res.json(fRating)
})

const uploadImages = asyncHandler(async (req, res)=>{
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
            fs.unlinkSync(path)
        }
        console.log(urls)
        const findProduct = await productModel.findByIdAndUpdate(id, 
            {
                Images:urls.map((file)=>{
                return file
                })
            }
        , {new :true})
        res.json(findProduct)

    } catch (error) {
        throw new Error(error)
    }
   
})



module.exports = 
{createProduct, getProduct,
getAllProduct, updateProduct,
deleteProduct, addToWishList,
rateProduct, rateProduct, uploadImages}