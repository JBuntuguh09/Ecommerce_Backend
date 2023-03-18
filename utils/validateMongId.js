const mongoose = require('mongoose')
const validateMongId = (id) =>{
    const  isValid = mongoose.Types.ObjectId.isValid(id)
    if(!isValid){
        throw new Error("This id is not valid")
    }
}

module.exports = validateMongId