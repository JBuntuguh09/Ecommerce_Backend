const asyncHandler = require('express-async-handler')
const validateMongId = require('../utils/validateMongId')
const { default: slugify } = require('slugify')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const couponModel = require('../models/couponModel')
const cartModel = require('../models/cartModel')

const createCoupon = asyncHandler(async(req, res)=>{
    try {
        const newCoupon = await couponModel.create(req.body)
        if(!newCoupon) throw new Error("Error. Not able to create coupon")
        res.json(newCoupon)
    } catch (error) {
        throw new Error(error)
    }
})

const getAllCoupons = asyncHandler(async(req, res)=>{
    try {
        const newCoupons = await couponModel.find()
        if(!newCoupons) throw new Error("Error. No coupon found")
        res.json(newCoupons)
    } catch (error) {
        throw new Error(error)
    }
})


const getCoupon = asyncHandler(async(req, res)=>{
    const {id} = req.params
    validateMongId(id)
    try {
        
        const newCoupon = await couponModel.findById(id)
        if(!newCoupon) throw new Error("Error. No coupon found")
        res.json(newCoupon)
    } catch (error) {
        throw new Error(error)
    }
})

const updateCoupon = asyncHandler(async(req, res)=>{
    const {id} = req.params
    validateMongId(id)
    try {
        const newCoupon = await couponModel.findByIdAndUpdate(id, req.body, {new:true})
        if(!newCoupon) throw new Error("Error. No coupon found")
        res.json(newCoupon)
    } catch (error) {
        throw new Error(error)
    }
})

const deleteCoupon = asyncHandler(async(req, res)=>{
    const {id} = req.params
    validateMongId(id)
    try {
        const newCoupon = await couponModel.findByIdAndDelete(id)
        
        res.json({msg:"Successfully deleted"})
    } catch (error) {
        throw new Error(error)
    }
})

const applyCoupon = asyncHandler(async (req, res)=>{
    const {Coupon} = req.body
    const {_id} = req.user
    try {
       const validCoupon = await couponModel.findOne({Name:Coupon})
       if(!validCoupon) throw new Error("Invalid coupon")

       const user = await userModel.findOne({_id})
       let { Products, CartTotal } = await cartModel.findOne({OrderBy:user._id}).populate("Products.Product")
       let totalDiscount = (CartTotal - (CartTotal * validCoupon.Discount)/100).toFixed(2)

       await cartModel.findOneAndUpdate({OrderBy:user._id}, {TotalAfterDiscount:totalDiscount},{new :true})
       
        res.json({msg: `Total after discount is ${totalDiscount}`})
        
    } catch (error) {
        throw new Error(error)
    }
})


module.exports = {createCoupon, getAllCoupons,
                getCoupon, updateCoupon, deleteCoupon,
            applyCoupon}