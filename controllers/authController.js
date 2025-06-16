const Doctor = require('../models/doctor')
const Patient = require('../models/user')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let doctor = await Doctor.findOne({ email });
    console.log('Fetched doctor object:', doctor);
    if (!doctor) {
      console.log('Doctor not found for email:', email);
      return res.status(404).json({ message: "Doctor not found" });
    }
    console.log('doctor["name"]:', doctor["name"]);
    console.log('doctor["password"] (hash):', doctor["password"]);
    console.log('Password entered:', password);

    // Use bcrypt to compare hashed password
    const isMatch = await bcrypt.compare(password, doctor.password);
    console.log('bcrypt.compare result:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const isProfileComplete =
      doctor["name"] &&
      doctor["specialization"] &&
      doctor["experience"] &&
      doctor["phone"] &&
      doctor["address"] &&
      doctor["fee"] &&
      doctor["bio"];
    console.log('isProfileComplete:', isProfileComplete);
    console.log('doctor["name"]:', doctor["name"]);
    res.json({
      token,
      role: "doctor",
      isProfileComplete: Boolean(isProfileComplete),
    });
    console.log('isProfileComplete:', isProfileComplete)

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    let existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: "Doctor already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newDoctor = new Doctor({ email, password: hashedPassword });
    await newDoctor.save();

    res.status(201).json({ message: "Doctor registered successfully" });
  } catch (error) {
    console.error('Registration error:', error); // log the error for debugging
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { login, register };
