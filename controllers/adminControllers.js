const admin = require("../models/adminSchema");
const faculty = require("../models/facultySchema");
const student = require("../models/studentSchema");
// const otp = require("../models/otpSchema");
const multer = require("multer");
const csv = require("csvtojson");
const nodemailer = require("nodemailer");
const CSV = require("fast-csv");
const fs = require("fs");
const exceljs = require("exceljs");
const Csvparser = require("json2csv").Parser;
const BACKEND_URL = process.env.BACKEND_URL;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});


exports.rejectStudent = async(req, res) =>{
  const stu = req.body;
  const Student = await student.findOne({ email: stu.email });
  const facName = Student.faculty_name
  if(Student){
    if(Student.status ==="requested"){
      const updateData = await student.findOneAndUpdate(
        { _id: Student._id },
        {
          $set: {
            status: "pending",
            category: "-"
            faculty_mail: "_mail_",
            faculty_name: "_name_",
          },
        },
        {
          returnOriginal: false,
        }
      );
      await updateData.save();
      console.log(Student);

      const mailOption = {
        from: process.env.EMAIL,
        to: Student.email,
        subject: "Minor Project Application Rejected",
        text: `${Student.name},
        Your application to work under ${facName} has been rejected. Please go to the Minor Project Portal and request to work under a faculty once again. Link to the portal: https://mujminorproject.vercel.app`,
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
     
    else if(Student.status ==="registered")
    {
      const facultyinfo = await faculty.findOne({ email: Student.faculty_mail });
      const updateData = await student.findOneAndUpdate(
        { _id: Student._id },
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
      console.log(Student);

      const mailOption = {
        from: process.env.EMAIL,
        to: Student.email,
        subject: "Minor Project Application Rejected",
        text: `${Student.name},
        Your application tnto work under ${facultyinfo.name} has been rejected. Please go to the Minor Project Portal and request to work under a faculty once again. Link to the portal: https://mujminorproject.vercel.app`,
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
  // console.log(Student);

}

exports.getStudents = async (req, res) => {
  const search = req.query.search || "";
  const page = req.query.page || 1;
  const ITEM_PER_PAGE = 50;

  const query = {
    name: { $regex: search, $options: "i" },
  };
  try {
    const skip = (page - 1) * ITEM_PER_PAGE;

    const count = await student.countDocuments(query);

    const usersdata = await student.find(query).limit(ITEM_PER_PAGE).skip(skip);

    const pageCount = Math.ceil(count / ITEM_PER_PAGE);

    res.status(200).json({
      Pagination: {
        count,
        pageCount,
      },
      usersdata,
    });
  } catch (error) {
    res.status(400).json({ message: "No Data Found" });
  }
};

exports.downsheetstudent = async (req, res) => {
  try {
    const Student = await student.find();

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
      "public/files/export/minor_project_list_student.csv"
    );

    csvStream.pipe(writablestream);

    writablestream.on("finish", function () {
      res.json({
        downloadUrl: `${BACKEND_URL}/files/export/minor_project_list_student.csv`,
      });
    });

    if (Student.length > 0) {
      Student.map((student) => {
        csvStream.write({
          name: student.name ? student.name : "-",
          email: student.email ? student.email : "-",
          registration_number: student.registration_number
            ? student.registration_number
            : "-",
          phone_number: student.phone_number ? student.phone_number : "-", 
          status: student.status ? student.status : "-",
          faculty_mail: student.faculty_mail ? student.faculty_mail : "-",
          faculty_name: student.faculty_name ? student.faculty_name : "-",
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

exports.downsheetfaculty = async (req, res) => {
  try {
    const Faculty = await faculty.find();

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
      "public/files/export/minor_project_list_faculty.csv"
    );

    csvStream.pipe(writablestream);

    writablestream.on("finish", function () {
      res.json({
        downloadUrl: `${BACKEND_URL}/files/export/minor_project_list_faculty.csv`,
      });
    });

    if (Faculty.length > 0) {
      Faculty.map((faculty) => {
        csvStream.write({
          name: faculty.name ? faculty.name : "-",
          email: faculty.email ? faculty.email : "-",
          // description_link: faculty.description_link
          //   ? faculty.description_link
          //   : "-",
          noOfStudent: faculty.noOfStudent,
          full: faculty.full,
          // noOfStudent: faculty.noOfStudent ? faculty.noOfStudent : "-",
          // full: faculty.full ? faculty.full : "-",
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

exports.findMaxNum = async (req, res) => {
  const num = await admin.findOne({ email: "minorprojecthandler@gmail.com" });

  if (num) {
    res.status(200).json(num.maxNoOfStudent);
  } else {
    res.status(400).json({ error: "Invalid", error });
  }
};

exports.setMaxNum = async (req, res) => {
  const Admin = await admin.findOne({ email: "minorprojecthandler@gmail.com" });
  const num = req.body;
  // console.log(Admin);
  // console.log(num.maxNoOfStudent);
  if (Admin && num) {
    const updateData = await admin.findOneAndUpdate(
      { _id: Admin._id },
      { $set: { maxNoOfStudent: num.maxNoOfStudent } },
      {
        returnOriginal: false,
      }
    );
    const save = await updateData.save();
    if (save) {
      res.status(200).json(save);
    } else {
      res.status(400).json({ error: "Invalid Entry" });
    }
  }
};

exports.facultyUpdate = async (req, res) => {
  // console.log("hello");
  try {
    await faculty.deleteMany({});
    console.log(req.file.path);
    let facData = [];
    csv()
      .fromFile(req.file.path)
      .then(async (response) => {
        for (let x = 0; x < response.length; x++) {
          const DescriptionLink = response[x].description_link || "_description_link_";
          const NoOfStudent = response[x].noOfStudent || 0;
          const Full = response[x].full || false;
          facData.push({
            email: response[x].email,
            name: response[x].name,
            description_link: DescriptionLink,
            noOfStudent: NoOfStudent,
            full: Full,
          });
        }

        await faculty.insertMany(facData);
      });

    res.status(200).json(req.file);
  } catch (error) {
    res.status(400).json({ error: "Invalid File", error });
  }
  // console.log("hello",req.file);
  // res.status(200).json(req.file);
  // // res.json (req.file).status (200);
};

exports.studentUpdate = async (req, res) => {
  try {
    await student.deleteMany({});

    let stuData = [];
    csv()
      .fromFile(req.file.path)
      .then(async (response) => {
        // console.log(response);

        for (let x = 0; x < response.length; x++) {
          const Status = response[x].status || "pending";
          const Faculty_mail = response[x].faculty_mail || "_mail_";
          const Faculty_name = response[x].faculty_name || "_name_";
          const Phone_number = response[x].phone_number || "_phone_";
          stuData.push({
            email: response[x].email,
            name: response[x].name,
            registration_number: response[x].registration_number,
            phone_number: Phone_number,
            status: Status,
            faculty_mail: Faculty_mail,
            faculty_name: Faculty_name,
          });
        }

        await student.insertMany(stuData);
      });

    res.status(200).json(req.file);
  } catch (error) {
    res.status(400).json({ error: "Invalid File", error });
  }
  // console.log("hello",req.file);
  // res.status(200).json(req.file);
  // // res.json (req.file).status (200);
};

exports.setLink = async (req, res) => {
  console.log(req.body);
  const link = req.body;
  const Admin = await admin.findOne({ email: "minorprojecthandler@gmail.com" });
  // const facInfo = await faculty.findOne({ email: req.params.email });
  if (link && Admin) {
    const updateData = await admin.findOneAndUpdate(
      { _id: Admin._id },
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
