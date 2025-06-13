
const Doctor = require("../models/doctor");
const User = require('../models/user.js')

const createOrUpdateProfile = async (req, res) => {
  console.log("Incoming request body:", req.body);
  const {
      fullName,
      email,
      password,
      phone,
      specialty,
      experience,
      fee,
      degrees,
      location,
      availableFrom,
      availableTo,
      bio,
      imageUrl, // optional
    } = req.body;
  let profile = await Doctor.findOne({ user: req.user._id });
  if (profile) {
     //if profile exists it update the profile
    Object.assign(profile, {  fullName,
      email,
      password,
      phone,
      specialty,
      experience,
      fee,
      degrees,
      location,
      availableFrom,
      availableTo,
      bio,
      imageUrl, });
  } else {
     //it creates profile and assign the details  
    profile = new Doctor({ user: req.user._id,email,password,phone, specialty, experience, fee,degrees,location, availableFrom,availableTo,bio,imageUrl });
  }
  await profile.save();
  res.json(profile);
};

//to find all doctors details
const getAllDoctors = async (req, res) => {
  const doctors = await Doctor.find().populate("user", "name email");
  res.json(doctors);
};

//to find single doctor
 const getDoctorById = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate("user", "name email");
  res.json(doctor);
};

module.exports={
    createOrUpdateProfile,
    getAllDoctors,
    getDoctorById
}