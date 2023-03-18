const Category = require('../models/categoryModel')

const validateMongId = require('../utils/validateMongId')
const jwt = require('jsonwebtoken')
const expressAsyncHandler = require('express-async-handler')
const sendEmail = require('./emailCtrl')
const crypto = require('crypto')



const createCategory = expressAsyncHandler(async (req, res)=>{
    try {
        const cats = await Category.create(req.body)
        if(!cats) throw new Error("Enter category name")
        res.json(cats)
    } catch (error) {
        throw new Error(error)
    }
})
const getCategory = expressAsyncHandler(async (req, res)=>{
    try {
        const cats = await Category.find()

        if(!cats) throw new Error("No categories found")

        res.json(cats)
    } catch (error) {
        throw new Error(error)
    }


})

const updateCategory = expressAsyncHandler(async (req, res)=>{
    const {id} =req.params
    validateMongId(id)
    try {
        const cats = await Category.findByIdAndUpdate(id, req.body,{new:true})

        if(!cats) throw new Error("No categories found")

        res.json(cats)
    } catch (error) {
        throw new Error(error)
    }


})

const deleteCategory = expressAsyncHandler(async (req, res)=>{
    const {id} =req.params
    validateMongId(id)
    try {
        const cats = await Category.findByIdAndDelete(id)

        if(!cats) throw new Error("No categories found")

        res.json({msg:"Successfully deleted"})
    } catch (error) {
        throw new Error(error)
    }


})

module.exports = {createCategory, getCategory,
                updateCategory, deleteCategory}