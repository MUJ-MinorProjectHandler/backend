const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken")

const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Not Valid Email!");
            }
        }
    },
    otp:{
        type:String,
        required:true
    }
});



const Otp = new mongoose.model("otp",otpSchema);

module.exports = Otp;