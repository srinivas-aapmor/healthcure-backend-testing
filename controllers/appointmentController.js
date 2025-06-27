const Appointment = require("../models/appointment");
const mongoose = require("mongoose");
const Doctor = require("../models/doctor"); // Register Doctor model for population
const nodemailer = require("nodemailer");
const User = require("../models/user"); // adjust path based on your structure

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "healthcure365@gmail.com",
    pass: "kqdf krbs tawqgwah",
  },
});

// ------------------ EMAIL TO PATIENT ------------------
const sendBookingEmail = async (email, patientName, doctorName, scheduledAt, consultationType, videoLink) => {
  const formattedDate = new Date(scheduledAt).toLocaleDateString();
  const formattedTime = new Date(scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  let message = `Hi ${patientName},\n\nYour appointment with Dr. ${doctorName} is confirmed for ${formattedDate} at ${formattedTime}.`;

  if (consultationType === "Online" && videoLink) {
    message += `\n\nVideo Consultation Link:\n${videoLink}\n(Please join at your scheduled time.)`;
  }

  message += `\n\nThank you for using HealthCure.`;

  const mailOptions = {
    from: "healthcure365@gmail.com",
    to: email,
    subject: "Appointment Confirmation - HealthCure",
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent to patient:", email);
  } catch (error) {
    console.error("Email to patient failed:", error);
  }
};

// ------------------ EMAIL TO DOCTOR ------------------
const sendBookingEmailToDoctor = async (email, doctorName, patientName, scheduledAt, consultationType, videoLink) => {
  const formattedDate = new Date(scheduledAt).toLocaleDateString();
  const formattedTime = new Date(scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  let message = `Hi Dr. ${doctorName},\n\nYou have a new appointment with patient ${patientName} scheduled for ${formattedDate} at ${formattedTime}.`;

  if (consultationType === "Online" && videoLink) {
    message += `\n\nVideo Consultation Link:\n${videoLink}\n(Please join at the scheduled time.)`;
  }

  message += `\n\n- HealthCure System`;

  const mailOptions = {
    from: "healthcure365@gmail.com",
    to: email,
    subject: "New Appointment Scheduled - HealthCure",
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Doctor email sent to:", email);
  } catch (error) {
    console.error("Failed to send email to doctor:", error);
  }
};

// ------------------ CREATE APPOINTMENT ------------------
const createAppointment = async (req, res) => {
  try {
    const { userId, doctorId, scheduledAt, consultationType, notes } = req.body;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: "Invalid doctorId" });
    }

    // Validate consultationType
    if (!["Online", "In-Person"].includes(consultationType)) {
      return res.status(400).json({ message: "Invalid consultationType" });
    }

    // Validate scheduledAt
    if (!scheduledAt || isNaN(new Date(scheduledAt).getTime())) {
      return res.status(400).json({ message: "Invalid scheduledAt date" });
    }

    const newAppointment = new Appointment({
      userId,
      doctorId,
      scheduledAt,
      consultationType,
      status: "pending",
      notes: notes || "",
    });

    const savedAppointment = await newAppointment.save();

  const patient = await mongoose.model("User").findById(userId);
    const doctor = await Doctor.findById(doctorId);

    // Step 4: Generate Jitsi links
    let videoLink = null;
    let patientVideoLink = null;
    let doctorVideoLink = null;

    if (consultationType === "Online") {
      const roomName = `HealthCure_${userId}_${doctorId}_${Date.now()}`;
      videoLink = `https://meet.jit.si/${roomName}`;
      // patientVideoLink = `${videoLink}#userInfo.displayName="${patient.name}"`;
      // doctorVideoLink = `${videoLink}#userInfo.displayName="Dr. ${doctor.name}"`;
      patientVideoLink = videoLink;
      doctorVideoLink = videoLink;

    }

    // Step 5: Send email & SMS
    await sendBookingEmail(patient.email, patient.name, doctor.name, scheduledAt, consultationType, patientVideoLink);
    await sendBookingEmailToDoctor(doctor.email, doctor.name, patient.name, scheduledAt, consultationType, doctorVideoLink);

    res.status(201).json(savedAppointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get all appointments 
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("userId", "name email")
      .populate("doctorId", "name specialization");
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id)
      .populate("userId", "name email")
      .populate("doctorId", "name specialization");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all appointments for a specific user (patient)
const getAppointmentsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching appointments for userId:", userId);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("Invalid userId received:", userId);
      return res.status(400).json({ message: "Invalid userId" });
    }
    const appointments = await Appointment.find({ userId })
      .populate("doctorId", "name specialization");
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching user appointments for userId:", req.params.userId, error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all appointments for a specific doctor
const getAppointmentsByDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.find({ doctorId })
      .populate("userId", "name email");

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// doctor wants to update appointment status

const updateAppointmentStatus = async (req, res) => {
  const { appointmentId } = req.params;
  const { status } = req.body;

  const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status provided." });
  }

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({ message: "Appointment status updated successfully.", appointment });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ message: "Server error while updating appointment status." });
  }
};

// Get today's appointments for a doctor
const getTodaysAppointmentsByDoctorId = async (req, res) => {
  try {
    let { doctorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: "Invalid doctorId" });
    }
    doctorId = new mongoose.Types.ObjectId(doctorId);
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    // Debug log for query
    console.log('Querying appointments with:', {
      doctorId: doctorId.toString(),
      scheduledAt: { $gte: start.toISOString(), $lte: end.toISOString() }
    });

    const appointments = await Appointment.find({
      doctorId,
      scheduledAt: { $gte: start, $lte: end }
    })
      .populate("userId", "name email");

    // Debug log for found appointments
    console.log('Appointments found:', appointments);

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  getAppointmentsByUserId,
  getAppointmentsByDoctorId,
  updateAppointmentStatus,
  getTodaysAppointmentsByDoctorId,
};

