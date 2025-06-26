const Appointment = require("../models/appointment");
const mongoose = require("mongoose");
const Doctor = require("../models/doctor");
const { v4: uuidv4 } = require('uuid');
const nodemailer = require("nodemailer");
const User = require("../models/user");


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

    // Generate room ID for online consultation
    const consultationRoomId = consultationType === "Online" ? uuidv4() : null;

    const newAppointment = new Appointment({
      userId,
      doctorId,
      scheduledAt,
      consultationType,
      consultationRoomId,
      status: "pending",
      notes: notes || "",
    });

    // Fetch user and doctor data for email if online
    if (consultationType === "Online") {
      const user = await User.findById(userId);
      const doctor = await Doctor.findById(doctorId);

      console.log("User email:", user?.email);
      console.log("Doctor email:", doctor?.email);

      if (user?.email && doctor?.email) {
        const roomLink = `http://localhost:3000/consultation/room/${consultationRoomId}`;

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const sendMailTo = async (recipient) => {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipient,
            subject: "Online Consultation Scheduled",
            html: `
              <h3>Your Online Consultation is Confirmed</h3>
              <p><strong>Date:</strong> ${new Date(scheduledAt).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${new Date(scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p><strong>Join Link:</strong> <a href="${roomLink}">${roomLink}</a></p>
            `,
          };
          await transporter.sendMail(mailOptions);
        };
        await sendMailTo(user.email);
        await sendMailTo(doctor.email);
      }
    }

    
    const savedAppointment = await newAppointment.save();
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
    //  Update status and return populated appointment
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true } 
    ).populate("doctorId", "name specialization");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    res.status(200).json({
      message: "Appointment status updated successfully.",
      appointment,
    });
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
    console.log('Querying appointments with:', {
      doctorId: doctorId.toString(),
      scheduledAt: { $gte: start.toISOString(), $lte: end.toISOString() }
    });

    const appointments = await Appointment.find({
      doctorId,
      scheduledAt: { $gte: start, $lte: end }
    })
      .populate("userId", "name email");
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