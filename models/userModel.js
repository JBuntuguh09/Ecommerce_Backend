const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt')
const crypto = require('crypto')

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    First_Name:{
        type:String,
        required:true,
        
    },
    Last_Name:{
        type:String,
        required:true,
        
    },
    Email:{
        type:String,
        required:true,
        unique:true,
    },
    Mobile:{
        type:String,
        required:true,
    },
    Password:{
        type:String,
        required:true,
    },
    Role:{
        type:String,
        default:"user"
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    Cart:{
        type: Array,
        default:[]
    }, 
     Address:{type: String},
    Wish_List:[{type: mongoose.Schema.Types.ObjectId, ref:"Product"}],
    Refresh_Token:{type:String},
    PasswordChangedAt:Date,
    PasswordResetToken: String,
    PasswordResetExpires:Date

    },
    {
        timestamps:true
    }
    );

userSchema.pre('save', async function (next){
    if(!this.isModified("Password")){
        next()
    }
    const salt = await bcrypt.genSaltSync(10);
    this.Password = await bcrypt.hash(this.Password, salt)

})


userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    
    return await bcrypt.compare(enteredPassword, this.Password);
}

userSchema.methods.createPasswordResetToken = async function(){
    const resetToken  = crypto.randomBytes(32).toString("hex")
    this.PasswordResetToken = crypto.createHash('sha256').update(resetToken)
    .digest('hex')
    this.PasswordResetExpires = Date.now()+30*60*3000 //10 mins

    return resetToken
}
//Export the model
module.exports = mongoose.model('User', userSchema);