const faculty = require("../models/facultySchema");
const student = require("../models/studentSchema");


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
