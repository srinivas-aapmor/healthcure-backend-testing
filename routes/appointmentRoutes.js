const express = require("express");





const router = express.Router();
const { createAppointment } = require("../controllers/appointmentController");
const { getAllAppointments } = require("../controllers/appointmentController");
const { getAppointmentById } = require("../controllers/appointmentController");
const { getAppointmentsByUserId } = require("../controllers/appointmentController");
const { getAppointmentsByDoctorId } = require("../controllers/appointmentController");
const { updateAppointmentStatus } = require("../controllers/appointmentController");


router.post("/book", createAppointment);
router.get("/", getAllAppointments);
router.get("/:id", getAppointmentById);
router.get("/user/:userId", getAppointmentsByUserId);
router.get("/doctor/:doctorId", getAppointmentsByDoctorId);
router.patch("/status/:appointmentId", updateAppointmentStatus);

module.exports = router;
