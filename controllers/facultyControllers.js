const admin = require("../models/adminSchema");
const faculty = require("../models/facultySchema");
const student = require("../models/studentSchema");
const nodemailer = require("nodemailer");
const CSV = require("fast-csv");
const fs = require("fs");
const BACKEND_URL = process.env.BACKEND_URL

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

exports.downpersonalsheet = async (req, res) => {
  try {
    console.log("hello");
    const Student = await student.find({faculty_mail:req.params.email});
      let result = '';
      let i = 0;
      let str=req.params.email;
    
      while (i < str.length && str[i] !== "@") {
        result += str[i];
        i++;
      }

    const csvStream = CSV.format({ headers: true });

    if (!fs.existsSync("public/files/export")) {
      if (!fs.existsSync("public/files")) {
        fs.mkdirSync("public/files/");
      }

      if (!fs.existsSync("public/files/export")) {
        fs.mkdirSync("./public/files/export");
      }
    }

    const writablestream = fs.createWriteStream(
      "public/files/export/"+result+".csv"
    );

    csvStream.pipe(writablestream);

    writablestream.on("finish", function () {
      res.json({
        downloadUrl: `${BACKEND_URL}/files/export/`+result+`.csv`,
      });
    });

    if (Student.length > 0) {
      Student.map((student) => {
        csvStream.write({
          Name: student.name ? student.name : "-",
          Email: student.email ? student.email : "-",
          Registration_Number: student.registration_number
            ? student.registration_number
            : "-",
          Phone_Number: student.phone_number ? student.phone_number : "-",
          Status: student.status ? student.status : "-",
          Faculty_Mail: student.faculty_mail ? student.faculty_mail : "-",
          Faculty_Name: student.faculty_name ? student.faculty_name : "-",
        });
      });
    }
    csvStream.end();
    writablestream.end();
  } catch (error) {
    console.log(error);
    res.status(401).json(error);
  }
};

exports.individualNum = async (req, res) => {
  const num = await faculty.findOne({ email: req.params.email });
  const admnum = await admin.findOne({ email: "minorprojecthandler@gmail.com" });
  if(admnum.maxNoOfStudent>num.noOfStudent){
    const updateNum = await faculty.findOneAndUpdate(
      { _id: num._id },
      {
        $set: {
          full: false,
        },
      },
      {
        returnOriginal: false,
      }
    );
    await updateNum.save();
  }
  else{
  const updateNum = await faculty.findOneAndUpdate(
    { _id: num._id },
    {
      $set: {
        full: true,
      },
    },
    {
      returnOriginal: false,
    }
  );
  await updateNum.save();
  }
  // console.log(num.noOfStudent);
  if(num){
  res.status(200).json(num.noOfStudent);}
};

exports.maxNum = async (req, res) => {
  const num = await admin.findOne({ email: "minorprojecthandler@gmail.com" });

  if (num) {
    res.status(200).json(num.maxNoOfStudent);
  } else {
    res.status(400).json({ error: "Invalid", error });
  }
};

exports.setLink = async (req, res) => {
  const link = req.body;
  const facInfo = await faculty.findOne({ email: req.params.email });
  if (link && facInfo) {
    const updateData = await faculty.findOneAndUpdate(
      { _id: facInfo._id },
      { $set: { description_link: link.description_link } },
      {
        returnOriginal: false,
      }
    );
    await updateData.save();
    res.status(200).json({ message: "Link updated successfully" });
  } else {
    res.status(400).json({ message: "Error! Try again after sometime" });
  }
};

exports.requestedStudents = async (req, res) => {
  const requestedstu = await student
    .find({ status: "requested", faculty_mail: req.params.email })
    .exec();
  if (requestedstu) {
    res.status(200).json(requestedstu);
  } else {
    res.status(400).json({ error: "Invalid Entry" });
  }
};

exports.selectedStudents = async (req, res) => {
  const selectedstu = await student
    .find({ status: "registered", faculty_mail: req.params.email })
    .exec();
  if (selectedstu) {
    res.status(200).json(selectedstu);
  } else {
    res.status(400).json({ error: "Invalid Entry" });
  }
};

exports.studentSelectedDecline = async (req, res) => {
  console.log(req.body);
  const { email, facultyemail } = req.body;
  console.log(email);
  console.log(facultyemail);

  if (email && facultyemail) {
    const studentinfo = await student.findOne({ email: email });
    const facultyinfo = await faculty.findOne({ email: facultyemail });
    if (studentinfo && facultyinfo) {
      const updateData = await student.findOneAndUpdate(
        { _id: studentinfo._id },
        {
          $set: {
            status: "pending",
            faculty_mail: "_mail_",
            faculty_name: "_name_",
          },
        },
        {
          returnOriginal: false,
        }
      );
      await updateData.save();
      const num = facultyinfo.noOfStudent - 1;
      const updateNum = await faculty.findOneAndUpdate(
        { _id: facultyinfo._id },
        {
          $set: {
            noOfStudent: num,
            full: false,
          },
        },
        {
          returnOriginal: false,
        }
      );
      await updateNum.save();
      console.log(studentinfo);

      const mailOption = {
        from: process.env.EMAIL,
        to: email,
        subject: "Minor Project Application Rejected",
        text: `${studentinfo.name},
        Your application to work under ${facultyinfo.name} has been rejected. Please go to the Minor Project Portal and request to work under a faculty once again.`,
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
    }
  }
};

exports.studentDecline = async (req, res) => {
  const { email, facultyemail } = req.body;
  console.log(email);
  console.log(facultyemail);

  if (email && facultyemail) {
    const studentinfo = await student.findOne({ email: email });
    const facultyinfo = await faculty.findOne({ email: facultyemail });
    if (studentinfo && facultyinfo) {
      const updateData = await student.findOneAndUpdate(
        { _id: studentinfo._id },
        {
          $set: {
            status: "pending",
            faculty_mail: "_mail_",
            faculty_name: "_name_",
          },
        },
        {
          returnOriginal: false,
        }
      );
      await updateData.save();
      console.log(studentinfo);

      const mailOption = {
        from: process.env.EMAIL,
        to: email,
        subject: "Minor Project Application Rejected",
        text: `${studentinfo.name},
        Your application to work under ${facultyinfo.name} has been rejected. Please go to the Minor Project Portal and request to work under a faculty once again.`,
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
    }
  }
};

exports.studentAccept = async (req, res) => {
  const { email, facultyemail } = req.body;
  console.log(email);
  console.log(facultyemail);

  if (email && facultyemail) {
    const studentinfo = await student.findOne({ email: email });
    const facultyinfo = await faculty.findOne({ email: facultyemail });
    const admininfo = await admin.findOne({
      email: "minorprojecthandler@gmail.com",
    });
    if (studentinfo && facultyinfo) {
      const updateData = await student.findOneAndUpdate(
        { _id: studentinfo._id },
        {
          $set: {
            status: "registered",
            faculty_mail: facultyinfo.email,
            faculty_name: facultyinfo.name,
          },
        },
        {
          returnOriginal: false,
        }
      );
      await updateData.save();
      const num = facultyinfo.noOfStudent + 1;
      const updateNum = await faculty.findOneAndUpdate(
        { _id: facultyinfo._id },
        {
          $set: {
            noOfStudent: num,
          },
        },
        {
          returnOriginal: false,
        }
      );
      await updateNum.save();
      console.log(studentinfo);

      if (num === admininfo.maxNoOfStudent) {
        const updateFull = await faculty.findOneAndUpdate(
          { _id: facultyinfo._id },
          {
            $set: {
              full: true,
            },
          },
          {
            returnOriginal: false,
          }
        );
        await updateFull.save();
          const updateStudentMail = await student.find({ status: "requested", faculty_mail: facultyemail });
          const updateStudent = await student.updateMany(
          { faculty_mail: facultyemail , status: "requested" },
          {
            $set: {
              status: "pending",
              faculty_mail: "_mail_",
              faculty_name: "_name_",
            },
          },
          {
            returnOriginal: false,
          }
          )
          // await updateStudent.save();

          for(let i=0;i<updateStudentMail.length;i++)
          {
            let tempEmail=updateStudentMail[i].email;
            let tempName = updateStudentMail[i].name;
          const mailOption = {
            from: process.env.EMAIL,
            to: tempEmail,
            subject: "Minor Project Application Rejected",
            text: `${tempName},
              Your application to work under ${facultyinfo.name} has been accepted. The Faculty will contact you for futher details`,
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
        }

      }

      const mailOption = {
        from: process.env.EMAIL,
        to: email,
        subject: "Minor Project Application Accepted",
        text: `${studentinfo.name},
          Your application to work under ${facultyinfo.name} has been accepted. The Faculty will contact you for futher details`,
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
    }
  }
};

// exports.individualNum = async (req, res) => {
//   const facnum = await faculty.findOne({ email: req.params.email });
//   const admnum = await admin.findOne({ email: "minorprojecthandler@gmail.com" });
//   if(facnum<admnum){
//       const updateNum = await faculty.findOneAndUpdate(
//         { _id: facnum._id },
//         {
//           $set: {
//             full: false,
//           },
//         },
//         {
//           returnOriginal: false,
//         }
//       );
//       await updateNum.save();
//       res.status(200).json(facnum.noOfStudent);
//   };
//   req.status(200).json(facnum.noOfStudent);
// }