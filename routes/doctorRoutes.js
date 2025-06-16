const express = require("express");
const router = express.Router();
const { getAllDoctors} = require("../controllers/doctorController");
const { getDoctorById } = require("../controllers/doctorController");
const { doctorLogin } = require("../controllers/doctorController");

 router.post("/login", doctorLogin);
router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);

module.exports = router;
