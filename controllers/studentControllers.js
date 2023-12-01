const faculty = require("../models/facultySchema");
const student = require("../models/studentSchema");
const admin = require("../models/adminSchema");
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

exports.studentInfo = async(req,res)=>{
    const stuInfo = await student.findOne({ email: req.params.email });
    if(stuInfo){
        res.status(200).json(stuInfo)
    }
    else{
        res.status(400).json({ error: "Invalid Entry" })
    }
}


exports.facultyInfo = async (req,res)=>{
    const facInfo = await faculty.find({ full : false }).select({ "name": 1,"email":1,"description_link":1, "_id": 0});

    if(facInfo){
        res.status(200).json(facInfo);
    }
    else{
        res.status(400).json({ error: "Invalid Entry", error })
    }
};

exports.facultyFullInfo = async (req,res)=>{
    const facInfo = await faculty.find({ full : true }).select({ "name": 1,"email":1,"description_link":1, "_id": 0});

    if(facInfo){
        res.status(200).json(facInfo);
    }
    else{
        res.status(400).json({ error: "Invalid Entry", error })
    }
};

exports.getLink = async(req,res)=>{
    const Admin = await admin.findOne({ email:"minorprojecthandler@gmail.com"});
    if(Admin){
        res.status(200).json(Admin.description_link)
    }
    else{
        res.status(400)
    }
}

exports.generateRequest = async (req,res)=>{
    const {semail, femail} = req.body;
    // const Admin = await admin.findOne({ email: "minorprojecthandler@gmail.com" });
    // console.log(semail)
    // console.log(femail);

    if(semail&&femail){
    const facultyname = await faculty.findOne({ email: femail });
    if(facultyname){
        const Student = await student.findOne({ email: semail });
        if (Student && facultyname.full===false) {
            const updateData = await student.findOneAndUpdate({ "_id": Student._id }, { "$set": { "status": "requested", "faculty_mail": femail, "faculty_name": facultyname.name}}, {
                returnOriginal: false
              });
            await updateData.save();
            const mailOption = {
                from: process.env.EMAIL,
                to: femail,
                subject: "Minor Project Application Request",
                text: `${facultyname.name},
                You have recieved a request from ${Student.name} to work under you, please open the minor project portal and take the nessessary action. Link for the Website is : https://mujminorproject.vercel.app`,
              };
        
              transporter.sendMail(mailOption, (error, info) => {
                if (error) {
                  console.log("error", error);
                  res.status(400).json({ error: "Email not sent" });
                } else {
                  console.log("Email sent", info.response);
                  res.status(200).json({ message: "Email sent sucessfully" });
                }
              });
            // console.log(Student);
            res.status(204);
        }
        else{
            res.status(401).json({ error: "Reload" });
        }
    }
    else{
        res.status(404).json({ error: "No data" });
        }
    }
    else{
        res.json({ error: "No data" });
    }


    
}
