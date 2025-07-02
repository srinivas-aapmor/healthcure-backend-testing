const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  console.log(email, password);
  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "user not found" });
    }

    // Use bcrypt to compare hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  const { id } = req.params;
  console.log(id, "ID");
  try {
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const registerUser = async (req, res) => {
  const { name, email, password,  } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please provide name, email, and password" });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const user = new User({ name, email, password, role: "patient" });
    await user.save();
    const token = generateToken(user._id);
    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  loginUser,
  getAllUsers,
  getUserById,
  registerUser,
};