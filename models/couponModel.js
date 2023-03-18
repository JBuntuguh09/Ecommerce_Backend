const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var couponSchema = new mongoose.Schema({
    Name:{
        type:String,
        required:true,
        unique:true,
        uppercase:true
    },
    Expiry:{
        type:Date,
        required:true,
        
        
    },
    Discount:{
        type:Number,
        required:true,
    }
    
},{timestamps:true});

//Export the model
module.exports = mongoose.model('Coupon', couponSchema);