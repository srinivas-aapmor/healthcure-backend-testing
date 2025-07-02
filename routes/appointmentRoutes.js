const express = require("express");


const router = express.Router();
const { createAppointment } = require("../controllers/appointmentController");
const { getAllAppointments } = require("../controllers/appointmentController");
const { getAppointmentById } = require("../controllers/appointmentController");
const { getAppointmentsByUserId } = require("../controllers/appointmentController");
const { getAppointmentsByDoctorId } = require("../controllers/appointmentController");
const { getTodaysAppointmentsByDoctorId } = require("../controllers/appointmentController");
const { updateAppointmentStatus } = require("../controllers/appointmentController");
const { getBookedSlotsByDoctorAndDate } = require("../controllers/appointmentController");
const { cancelAppointmentByDoctor }  = require("../controllers/appointmentController");

router.post("/book", createAppointment);
router.get("/", getAllAppointments);
router.get("/booked-slots", getBookedSlotsByDoctorAndDate);

router.get("/user/:userId", getAppointmentsByUserId);
router.get("/doctor/today/:doctorId", getTodaysAppointmentsByDoctorId);
router.get("/doctor/:doctorId", getAppointmentsByDoctorId);
router.patch("/status/:appointmentId", updateAppointmentStatus);
router.get("/:id", getAppointmentById);
router.patch("/appointments/:appointmentId/status", updateAppointmentStatus);
router.patch("/:appointmentId/cancel-by-doctor", cancelAppointmentByDoctor);

module.exports = router;
