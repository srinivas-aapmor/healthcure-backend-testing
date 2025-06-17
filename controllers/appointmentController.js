const Appointment = require("../models/appointment");



const createAppointment = async (req, res) => {
  try {
    console.log("Incoming payload:", req.body);
    const { userId, doctorId, scheduledAt, consultationType, notes } = req.body;

    const newAppointment = new Appointment({
      userId,
      doctorId,
      scheduledAt,
      consultationType,
      status: "pending", // default status
      notes: notes || "", // optional field
    });

    const savedAppointment = await newAppointment.save();
    res.status(201).json(savedAppointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Server error" });
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
    const appointments = await Appointment.find({ userId })
      .populate("doctorId", "name specialization");

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    res.status(500).json({ message: "Server error" });
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


module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  getAppointmentsByUserId,
  getAppointmentsByDoctorId,
  updateAppointmentStatus,
};