const express = require('express')
const { createCoupon, getAllCoupons, getCoupon, updateCoupon, deleteCoupon, applyCoupon } = require('../controller/couponCtrl')
const { authMiddleWare, isAdmin } = require('../middleware/authMiddleWare')
const router = express.Router()

router.post('/', authMiddleWare,createCoupon)
router.get('/getAllCoupons', authMiddleWare, getAllCoupons)
router.get('/getCoupon/:id', authMiddleWare,getCoupon)
router.put('/updateCoupon/:id', authMiddleWare,updateCoupon)
router.delete('/deleteCoupon/:id', authMiddleWare,deleteCoupon)
router.put('/apply-coupon', authMiddleWare,applyCoupon)




module.exports = router