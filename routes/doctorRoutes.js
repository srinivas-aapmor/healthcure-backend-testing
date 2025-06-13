const express = require("express");
const { createOrUpdateProfile, getAllDoctors, getDoctorById } = require("../controllers/doctorController");
const {login}= require ("../controllers/authController")

const verifyToken = require("../middleware/authmiddleware");  
const roleCheck = require('../middleware/rolemiddleware');   

const router = express.Router();

router.post("/login", login); 
router.post("/profile", verifyToken, roleCheck(["doctor"]), createOrUpdateProfile);
router.get("/", verifyToken, getAllDoctors);
router.get("/:id", verifyToken, getDoctorById);

module.exports = router;
