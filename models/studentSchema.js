const mongoose = require("mongoose");
const validator = require("validator");

const studentSchema = new mongoose.Schema({
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
    },
    registration_number:{
        type:String,
    },
    phone_number:{
        type:String,
    },
    status:{
        type:String,
    },
    faculty_mail:{
        type:String,
    },
    faculty_name:{
        type:String,
    },
    
});

const student = new mongoose.model("student",studentSchema);

module.exports = student;