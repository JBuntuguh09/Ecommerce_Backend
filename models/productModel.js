const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    Title:{
        type:String,
        required:true,
        trim:true,
    },
    Slug:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    Description:{
        type:String,
        required:true,
        
        
    },
    Price:{
        type:Number,
        required:true,
    },
    category:{
        type:String,
        required:true
    },
    Quantity:{
        type:Number,
        required:true,
    },
    Images:{
        type:Array,
    },
    Color:{
        type:String,
        required:true,
    },
    Brand:{
        type:String,
        required:true,
    },
    Sold:{
        type:Number,
        default:0
    },
    Ratings:[
        {
            Star:Number,
            Comment:String,
            PostedBy:{type:mongoose.Schema.Types.ObjectId, ref:'user'}
        }
    ],
    TotalRating:{
        type:String,
        default:0
    }
    },
    {timestamps:true}
);

//Export the model
module.exports = mongoose.model('Product', userSchema);