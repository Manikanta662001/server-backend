const mongoose = require("mongoose")

const userSchema =new mongoose.Schema({
    firstName:{
        type:String,
        require:true
    },
    lastName:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true
    },
    profileImageUrl:{
        type:String,
        require:true
    }
})
module.exports.Registermodel = new mongoose.model('registereddata',userSchema)