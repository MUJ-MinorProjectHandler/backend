const admin = require("../models/adminSchema");
const faculty = require("../models/facultySchema");
const student = require("../models/studentSchema");
const Otp = require("../models/otpSchema");
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});


exports.allLogin = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Please Enter your Email" });
  }

  try {
    const preadmin = await admin.findOne({ email: email });
    const prefaculty = await faculty.findOne({ email: email });
    const prestudent = await student.findOne({email:email});
    console.log(preadmin);
    console.log(prefaculty);
    if (preadmin || prefaculty || prestudent) {
      const OTP = Math.floor(100000 + Math.random() * 900000);
      console.log(OTP);
      const existEmail = await Otp.findOne({ email: email });

      if (existEmail) {
        const updateData = await Otp.findByIdAndUpdate(
          { _id: existEmail._id },
          { otp: OTP },
          { new: true }
        );
        await updateData.save();

        const mailOption = {
          from: process.env.EMAIL,
          to: email,
          subject: "OTP for Login into Minor Project Handler",
          text: `The OTP for login:- ${OTP}`,
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
      }else {
        const saveOtpData = new Otp({
          email,
          otp: OTP,
        });

        console.log(saveOtpData);

        await saveOtpData.save();

        const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: "Sending Email For Otp Validation",
          text: `OTP:- ${OTP}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("error", error);
            res.status(400).json({ error: "Email not send" });
          } else {
            console.log("OTP sent", info.response);
            res.status(200).json({ message: "OTP sent Successfully" });
          }
        });
      }
    } else {
      res.status(401).json({ error: "This User does not exist" });
    }
  } catch (error) {
    res.status(400).json({ error: "Invalid Details", error });
  }
};

exports.otpLogin = async (req, res) => {
  const { email, otp } = req.body;

  if (!otp || !email) {
    res.status(400).json({ error: "Please Enter Your OTP and email" });
  }

  try {
    const otpverification = await Otp.findOne({ email: email });

    if (otpverification.otp === otp) {
        const preadmin = await admin.findOne({ email: email });
        const prefaculty = await faculty.findOne({email: email});
        const prestudent = await student.findOne({email:email});
        console.log(prefaculty);
      if (preadmin) {
        // const token = createToken(preadmin._id);
        const token = "qawdemritn";
        res.status(200).json({ message: "Admin Login Succesfully Done! Please wait", userToken: token});
      }
      else if(prefaculty){
        const token = "qfwaecrutlytuy";
        res.status(201).json({ message: "Login Succesfully Done!  Please wait", userToken: token });
      }
      else if(prestudent){
        const token = "qswteurdteynut";
        res.status(202).json({ message: "Login Succesfully Done! Please wait", userToken: token });
      }
    } else {
      console.log("wrong");
      res.status(400).json({ error: "Invalid Otp" });
    }
  } catch (error) {
    res.status(400).json({ error: "Invalid Details", error });
  }
};
