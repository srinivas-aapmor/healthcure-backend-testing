const Doctor = require('../models/doctor')
const Patient = require('../models/user')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check Doctor collection
    let user = await Doctor.findOne({ email });
    let role = "doctor";
    console.log(user);

    if (!user) {
      // 2. Check Patient collection
      user = await Patient.findOne({ email });
      role = "patient";
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid email " });
    }

    // 3. Compare password
    console.log(user.password)
    const isMatch = (password=== user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid  password" });
    }

    // 4. Generate token
    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    // console.log(user)
    res.status(200).json({
      token,
      user,
      role,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { login };
