const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var blogSchema = new mongoose.Schema({
    Title:{
        type:String,
        required:true,
    
    },
    Description:{
        type:String,
        required:true,
      
    },
    Category:{
        type:String,
        required:true
    },
    NumViews:{
        type:Number,
        default:0,
    },
    isLiked : {
        type:Boolean,
        default:false
    },
    isDisliked : {
        type:Boolean,
        default:false
    },
    Likes : [{
        type:mongoose.Schema.Types.ObjectId, 
        ref:"User",

    }],
    Dislikes : [{
        type:mongoose.Schema.Types.ObjectId, 
        ref:"User",

    }],
    Image:{
        type:'String',
        default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTrOX2_Izasbi-lb2eoatoAMzsyGeDbShdNAccph_SzdvZdno1I3DIss3-wcsE-TRUAV0&usqp=CAU"
    },
    Author:{
        type:String,
        default:"Admin",
    }

},
    {
        toJSON:{
            virtuals:true
        },
        toObject:{
            virtuals:true
        },
        timestamps:true
    }
    
);

//Export the model
module.exports = mongoose.model('Blog', blogSchema);