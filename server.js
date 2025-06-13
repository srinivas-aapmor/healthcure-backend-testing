const express = require('express');
const dotenv = require('dotenv');
const dbConnect = require('./config/dbConnect')
const cors = require('cors');

require("dotenv").config();

const app= express();
 dbConnect();
 app.use(express.json());
 app.use(cors());

 //routes
 app.use("/api/auth",require('./routes/authRoutes'));
 app.use("/api/doctors",require('./routes/doctorRoutes'));
 app.use("/api/appointments",require('./routes/appointmentRoutes'));
 

 //server
 const PORT = process.env.PORT;
 app.listen(5000,()=>{console .log(`server running on ${PORT}`)})