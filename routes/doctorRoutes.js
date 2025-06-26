const express = require("express");
const multer = require("multer");

const { createOrUpdateProfile, getAllDoctors, getDoctorById, updateAvailability } = require("../controllers/doctorController");
const { login, register } = require("../controllers/authController")

const verifyToken = require("../middleware/authmiddleware");
const roleCheck = require('../middleware/rolemiddleware');
const { getDoctorAvailability } = require("../controllers/doctorController");

const router = express.Router();

// Memory storage for image upload
const storage = multer.memoryStorage();
const upload = multer({ storage });


//routes 
router.post("/login", login);
router.post("/profile", verifyToken, roleCheck(["doctor"]), upload.single("image"), createOrUpdateProfile);
router.get("/", getAllDoctors);
router.get("/:id", verifyToken, getDoctorById);
router.put("/availability", verifyToken, roleCheck(["doctor"]), updateAvailability);
router.post("/register", register);
router.get("/availability/:id", getDoctorAvailability);


module.exports = router;
