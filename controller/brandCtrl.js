const Brand = require('../models/brandModel')

const validateMongId = require('../utils/validateMongId')
const jwt = require('jsonwebtoken')
const expressAsyncHandler = require('express-async-handler')
const sendEmail = require('./emailCtrl')
const crypto = require('crypto')



const createBrand = expressAsyncHandler(async (req, res)=>{
    try {
        const cats = await Brand.create(req.body)
        if(!cats) throw new Error("Enter Brand name")
        res.json(cats)
    } catch (error) {
        throw new Error(error)
    }
})
const getBrand = expressAsyncHandler(async (req, res)=>{
    try {
        const cats = await Brand.find()

        if(!cats) throw new Error("No brands found")

        res.json(cats)
    } catch (error) {
        throw new Error(error)
    }


})

const updateBrand = expressAsyncHandler(async (req, res)=>{
    const {id} =req.params
    validateMongId(id)
    try {
        const cats = await Brand.findByIdAndUpdate(id, req.body,{new:true})

        if(!cats) throw new Error("No brand found")

        res.json(cats)
    } catch (error) {
        throw new Error(error)
    }


})

const deleteBrand = expressAsyncHandler(async (req, res)=>{
    const {id} =req.params
    validateMongId(id)
    try {
        const cats = await Brand.findByIdAndDelete(id)

        if(!cats) throw new Error("No brands found")

        res.json({msg:"Successfully deleted"})
    } catch (error) {
        throw new Error(error)
    }


})

module.exports = {createBrand, getBrand,
                updateBrand, deleteBrand}