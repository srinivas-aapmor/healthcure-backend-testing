const Doctor = require("../models/doctor");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Doctor Login Controller
const doctorLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  try {
    const user = await User.findOne({ email, role: "doctor" });

    if (!user) {
      return res.status(401).json({ message: "Doctor not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Doctor login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Doctor login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("userId", "-password");
    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get doctor by ID
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("userId", "-password");
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.status(200).json(doctor);
  } catch (error) {
    console.error("Error fetching doctor:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
    doctorLogin,
  getAllDoctors,
  getDoctorById,
};