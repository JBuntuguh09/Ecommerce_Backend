const cloudinary = require('cloudinary')
const dotenv = require('dotenv');

dotenv.config()
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEYS,
    api_secret: process.env.CLOUD_SECRET
})

const uploadImg=async (fileToUpload)=>{
    console.log(process.env.CLOUD_KEYS, process.env.CLOUD_SECRET);
    return new Promise((resolve)=>{
        cloudinary.uploader.upload(fileToUpload, (result)=>{
            resolve({
                url:result.secure_url,
            },
            {
                resource_type:'auto'
            })
        })
    })
}

module.exports = uploadImg