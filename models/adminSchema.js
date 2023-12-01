const mongoose = require("mongoose");
const validator = require("validator");

const adminSchema = new mongoose.Schema({
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
    maxNoOfStudent:{
        type:Number,
        required:true
    },
    description_link:{
        type:String,
    },
});

const admin = new mongoose.model("admin",adminSchema);


module.exports = admin;
