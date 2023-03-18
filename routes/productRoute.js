const express = require('express')
const { createProduct, getProduct, getAllProduct, updateProduct, deleteProduct, addToWishList, rateProduct, uploadImages } = require('../controller/productCtrl')
const { authMiddleWare, isAdmin } = require('../middleware/authMiddleWare')
const { uploadPhoto, productImgResize } = require('../middleware/uploadImages')
const router = express.Router()


router.post('/createProduct', authMiddleWare, createProduct)
router.get('/getProduct/productId=:id',authMiddleWare, getProduct)
router.get('/getAllProducts', authMiddleWare, getAllProduct)
router.put('/updateProduct/productId=:id',authMiddleWare, updateProduct)
router.delete('/deleteProduct/productId=:id', authMiddleWare, deleteProduct)
router.put('/addToWishlist', authMiddleWare, addToWishList)
router.put("/rating", authMiddleWare, rateProduct)
router.put('/upload/:id', authMiddleWare
, uploadPhoto.array('images', 10), 
productImgResize, uploadImages)


module.exports = router