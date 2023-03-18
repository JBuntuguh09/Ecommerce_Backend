const express = require('express')
const { createBlog, updateBlog, getBlog, getAllBlog, deleteBlog, likeBlog } = require('../controller/blogCtrl')
const { createUser, loginUser, getAllUser, getUser, updateUser, deleteUser, blockUser, unblockUser, handleRefreshToken, logout, updatePassword, forgotPasswordToken, resetPassword } = require('../controller/userCtrl')
const { authMiddleWare, isAdmin } = require('../middleware/authMiddleWare')
const router = express.Router()


router.post("/createBlog", createBlog)
router.put("/updateBlog/:id", updateBlog)
router.get("/getBlog/:id", getBlog)
router.get("/getAllBlog", getAllBlog)
router.delete("/delBlog/:id", deleteBlog)
router.put('/likes',authMiddleWare, likeBlog)

module.exports = router