const Doctor = require("../models/doctor");

const User = require('../models/user.js')
const bcrypt = require("bcryptjs");

const createOrUpdateProfile = async (req, res) => {
  console.log("Incoming request body:", req.body);
  const {
    name,
    email,
    password,
    phone,
    specialization,
    experience,
    fee,
    degrees,
    address,
    from,
    to,
    bio,
    image // image is optional
  } = req.body;

  const imgData = req.file
    ? {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    }
    : undefined;

  // To find doctor by email 
  let profile = await Doctor.findOne({ email });
  if (profile) {
    //To update password 
    if (password && password.trim() !== "") {
      profile.password = await bcrypt.hash(password, 10);
    }


    if (imgData) {
      profile.img = imgData;
    }
    // Update other fields if provided and not empty
    Object.entries({ name, phone, specialization, experience, fee, degrees, address, from, to, bio }).forEach(([key, value]) => {
      if (value && value.toString().trim() !== "") {
        profile[key] = value;
      }
    })
  } else {
    // for new profile
    let hashedPassword = password && password.trim() !== "" ? await bcrypt.hash(password, 10) : undefined;
    profile = new Doctor({
      name,
      email,
      password: hashedPassword,
      phone,
      specialization,
      experience,
      fee,
      degrees,
      address,
      from,
      to,
      bio,
      image: imgData
    });
  }
  await profile.save();
  // to save in order
  const formattedDoctor = {
    _id: profile._id,
    name: profile.name,
    email: profile.email,
    password: profile.password,
    phone: profile.phone,
    specialization: profile.specialization,
    experience: profile.experience,
    fee: profile.fee,
    degrees: profile.degrees,
    address: profile.address,
    from: profile.from,
    to: profile.to,
    bio: profile.bio,
    role: profile.role,
    image: profile.image
  };
  res.json(formattedDoctor);
};

//to find all doctors details
const getAllDoctors = async (req, res) => {
  const doctors = await Doctor.find().sort({ name: 1 });

  const formattedDoctors = doctors.map(doc => ({
    _id: doc._id,
    name: doc.name,
    email: doc.email,
    specialization: doc.specialization,
    experience: doc.experience,
    fee: doc.fee,
    bio: doc.bio,
    phone: doc.phone,
   hasImage: !!(doc.img && doc.img.data),

  }));

  res.json(formattedDoctors);
};


//to find single doctor
const getDoctorById = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  res.json(doctor);
};

// Update doctor availability and time slots
const updateAvailability = async (req, res) => {
  try {

    const doctorId = req.user.id;
    const { dates, timeSlots } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    //to update date
    if (Array.isArray(dates)) {
      doctor.availability = dates;
    }
    // to update timeSlots 
    if (Array.isArray(timeSlots)) {
      doctor.timeSlots = timeSlots.filter(slot => typeof slot === 'string' && slot.trim() !== '');
    }
    await doctor.save();
    res.json({ success: true, availability: doctor.availability, timeSlots: doctor.timeSlots });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getDoctorAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json({
      availability: doctor.availability || [],
      timeSlots: doctor.timeSlots || []
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};


module.exports = {
  createOrUpdateProfile,
  getAllDoctors,
  getDoctorById,
  updateAvailability,
  getDoctorAvailability
}
