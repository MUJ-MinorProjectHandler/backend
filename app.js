require("dotenv").config();
const express = require("express");
const cors = require("cors");
const router = require("./Routes/router");
const bodyParser = require('body-parser');
const path = require("path");
require("./db/conn");

const app=express();

app.use(express.json({limit: '50mb'}));


app.use(cors());
app.use(router);

app.use (bodyParser.json ({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));
app.use(express.static(path.resolve(__dirname, 'public')));

app.use("/files",express.static("./public/files"));


app.listen(process.env.PORT, ()=>{
        console.log(`Server started at Port No: ${process.env.PORT}`);
})