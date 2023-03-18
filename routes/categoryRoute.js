const express = require('express')
const { getCategory, createCategory, updateCategory, deleteCategory } = require('../controller/categoryCtrl')
const { authMiddleWare, isAdmin } = require('../middleware/authMiddleWare')
const router = express.Router()


router.post("/createCategory", authMiddleWare, createCategory)
router.get("/getCategories", authMiddleWare, getCategory)
router.put("/updateCategory/:id", authMiddleWare, updateCategory)
router.delete("/deleteCategory/:id", authMiddleWare, deleteCategory)



module.exports = router
