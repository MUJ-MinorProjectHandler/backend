const express = require("express");
const router = new express.Router();
const controllers = require("../controllers/controllers");
const adminControllers = require("../controllers/adminControllers");
const facultyControllers = require("../controllers/facultyControllers");
const studentControllers = require("../controllers/studentControllers");
const multer = require("multer");
const bodyParser = require('body-parser');
const fs = require("fs");
const admin = require("../models/adminSchema");

// const app = express();

//main
router.post("/login", controllers.allLogin)

router.post("/otpverify", controllers.otpLogin)


//student

router.get("/student/facultyinfo",studentControllers.facultyInfo)

router.get("/student/facultyfullinfo",studentControllers.facultyFullInfo)

router.post("/student/request",studentControllers.generateRequest)

router.get("/student/:email", studentControllers.studentInfo)

//faculty

// router.post("/faculty/checknum/:email", facultyControllers.checknum)

// router.post("/faculty/setlink/:email", facultyControllers.setLink)

router.get("/faculty/maxnum",facultyControllers.maxNum)

router.get("/faculty/num/:email",facultyControllers.individualNum)

router.get("/faculty/reqstu/:email",facultyControllers.requestedStudents)

router.post("/faculty/declineselceted",facultyControllers.studentSelectedDecline)

router.post("/faculty/decline",facultyControllers.studentDecline)

router.post("/faculty/accept",facultyControllers.studentAccept)

router.get("/faculty/selstu/:email", facultyControllers.selectedStudents)

router.get("/faculty/download/:email", facultyControllers.downpersonalsheet)

//admin

router.post("/admin/setlink", adminControllers.setLink)

router.post("/admin/rejectstudent", adminControllers.rejectStudent)

router.get("/admin/fulllist", adminControllers.getStudents)

router.get("/admin/downloadstudent", adminControllers.downsheetstudent)

router.get("/admin/downloadfaculty", adminControllers.downsheetfaculty)

router.get("/admin/findmaxnum", adminControllers.findMaxNum)

router.post("/admin/setmaxnum", adminControllers.setMaxNum)


const storage = multer.diskStorage({
  destination:(req,file,cb) =>{
    cb(null,'./public/uploads')
  },
  filename:(req,file,cb) =>{
    cb(null,file.originalname )
  }
});

const upload = multer({storage:storage});


router.post('/upload/faculty',upload.single('file'),adminControllers.facultyUpdate)


router.post('/upload/student',upload.single('file'),adminControllers.studentUpdate)

module.exports = router;
