const mongoose = require("mongoose");
const validator = require("validator");

const facultySchema = new mongoose.Schema({
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
    name:{
        type:String,
        required:true,
        trim:true
    },
    description_link:{
        type:String
    },
    noOfStudent:{
        type:Number
    },
    full:{
        type:Boolean
    }
});

const faculty = new mongoose.model("faculty",facultySchema);

module.exports = faculty;