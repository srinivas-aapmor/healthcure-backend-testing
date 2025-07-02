const Appointment = require("../models/appointment");
const mongoose = require("mongoose");
const Doctor = require("../models/doctor");
const { v4: uuidv4 } = require('uuid');
const nodemailer = require("nodemailer");
const User = require("../models/user"); 

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "healthcure365@gmail.com",
    pass: "kqdf krbs tawqgwah",
  },
});

// EMAIL TO PATIENT 
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

// EMAIL TO DOCTOR 
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

       if (!["Online", "In-Person"].includes(consultationType)) {
      return res.status(400).json({ message: "Invalid consultationType" });
    }

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

  const patient = await mongoose.model("User").findById(userId);
    const doctor = await Doctor.findById(doctorId);

    //  Generate Jitsi links
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

    // Send email & SMS
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
      console.log("Populated appointments:", appointments);

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

const updateAppointmentStatus = async (req, res) => {
  const { appointmentId } = req.params;
  const { status, reason } = req.body;

  const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status provided." });
  }

  try {
    // First: find the appointment and populate related data
    const appointment = await Appointment.findById(appointmentId)
      .populate("doctorId", "name email")
      .populate("userId", "name email");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    // Check time BEFORE saving
    if (status === "cancelled") {
      const now = new Date();
      const scheduledAt = new Date(appointment.scheduledAt);
      const diffMs = scheduledAt - now;
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 1) {
        return res.status(400).json({
          message: "Cannot cancel appointment less than 1 hour before the scheduled time."
        });
      }
    }

    // Now safe to update
    appointment.status = status;
    await appointment.save();

    // Send email to patient
if (status === "cancelled" && appointment.userId?.email) {
  const patientMailOptions = {
    from: "healthcure365@gmail.com",
    to: appointment.userId.email,
    subject: "Appointment Cancelled - HealthCure",
    text: `Dear ${appointment.userId.name},\n\nWe regret to inform you that your appointment with Dr. ${appointment.doctorId.name} has been cancelled.
    Reason: ${reason || "No specific reason provided."}
    \n\nYou can book a new appointment at your convenience.\n\nRegards,\nHealthCure Team`
  };

  await transporter.sendMail(patientMailOptions);
  console.log("Cancellation email sent to patient:", appointment.userId.email);
}

//Send email to doctor
if (status === "cancelled" && appointment.doctorId?.email) {
  const doctorMailOptions = {
    from: "healthcure365@gmail.com",
    to: appointment.doctorId.email,
    subject: "Patient Appointment Cancelled",
    text: `Dear Dr. ${appointment.doctorId.name},\n\nYour patient ${appointment.userId.name} has cancelled their appointment scheduled for ${new Date(appointment.scheduledAt).toLocaleString()}.
    Reason for cancellation: ${reason || "No reason provided."}
    \n\nRegards,\nHealthCure Team`
  };

  await transporter.sendMail(doctorMailOptions);
  console.log("Cancellation email sent to doctor:", appointment.doctorId.email);
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

const getBookedSlotsByDoctorAndDate = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ message: "Missing doctorId or date" });
    }

    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    const appointments = await Appointment.find({
      doctorId,
      scheduledAt: { $gte: start, $lte: end },
      status: { $ne: "cancelled" } 
    });

    const bookedSlots = appointments.map((appt) => {
      const start = new Date(appt.scheduledAt);
      const endTime = new Date(start.getTime() + 30 * 60000); 

      const startStr = start.toTimeString().slice(0, 5);
      const endStr = endTime.toTimeString().slice(0, 5);

      return `${startStr}-${endStr}`;
    });

    res.status(200).json({ bookedSlots });
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
  getBookedSlotsByDoctorAndDate,
};

