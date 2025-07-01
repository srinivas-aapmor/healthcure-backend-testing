const User = require('../models/user');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/doctor')

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; 
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 

    //find user and check pwd
    let user = await User.findById(decoded.id).select("-password");
   
    if (!user) {
      user = await Doctor.findById(decoded.id).select("-password");
    }
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("verifyToken error:", err);
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = verifyToken;
