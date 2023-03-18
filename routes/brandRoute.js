const express = require('express')
const { getBrand, createBrand, updateBrand, deleteBrand } = require('../controller/brandCtrl')
const { authMiddleWare, isAdmin } = require('../middleware/authMiddleWare')
const router = express.Router()


router.post("/createBrand", authMiddleWare, createBrand)
router.get("/getBrands", authMiddleWare, getBrand)
router.put("/updateBrand/:id", authMiddleWare, updateBrand)
router.delete("/deleteBrand/:id", authMiddleWare, deleteBrand)



module.exports = router
