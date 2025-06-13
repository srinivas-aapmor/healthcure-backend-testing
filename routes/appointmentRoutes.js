const express = require("express");
const { bookAppointment, getMyAppointments, updateStatus } = require("../controllers/appointmentsController");
const verifyToken = require ('../middleware/authmiddleware');
const { getDoctorAppointmentsById } = require('../controllers/appointmentsController');


const router = express.Router();

router.post("/book", verifyToken, bookAppointment);
router.get("/",verifyToken, getMyAppointments);
router.put("/:id/status", verifyToken, updateStatus);
router.get("/doctor/:doctorId", getDoctorAppointmentsById);



module.exports = router;
