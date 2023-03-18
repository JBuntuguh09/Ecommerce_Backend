const { default: mongoose } = require("mongoose");

// Declare the Schema of the Mongo model
var cartSchema = new mongoose.Schema({
    Products:[
        {
        Product:{
            type:mongoose.Schema.Types.ObjectId, 
            ref:"Product"
        },
        Count:Number,
        Color:String,
        Price:Number,
    }
],
    CartTotal:Number,
    TotalAfterDiscount:Number,
    OrderBy: {
        type : mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},
{
    timestamps:true
}

);

//Export the model
module.exports = mongoose.model('Cart', cartSchema);

