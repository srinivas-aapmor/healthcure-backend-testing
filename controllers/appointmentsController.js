const Appointment = require('../models/appointments');
const Doctor = require("../models/doctor");

const bookAppointment=async(req,res)=>{
   console.log("Incoming data:", req.body);
    const {doctorId,date}=req.body;

     const doctorExists = await Doctor.findById(doctorId);
    if (!doctorExists) {
      return res.status(400).json({ message: "Invalid doctor ID" });
    }
     const appointment = new Appointment({
        patient:req.user._id,
        doctor: doctorId,
        date,
     })
     await appointment.save();
     console.log("saved appointments:",appointment)
     return res.status(201).json({ message: "Appointment booked", appointment });
    
}

//to get appointments for patient using doctor id

const getMyAppointments = async (req, res) => {
  let filter = {};

  if (req.user.role === "doctor") {
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
console.log("Doctor Profile:", doctorProfile); 


    if (!doctorProfile) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }
    filter = { doctor: doctorProfile._id };
  } else {
    filter = { patient: req.user._id };
  }

  const appointments = await Appointment.find(filter)
    .populate("doctor")
    .populate("patient");
    
   return res.json(appointments);
};

//to update status by doctor

const updateStatus = async (req, res) => {
  const { status } = req.body || {};

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = status;
    await appointment.save();

    return res.json({ message: "Status updated", appointment });
  } catch (err) {
    console.error("Error updating status:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

//doctor can see his own appointments by his id
const getDoctorAppointmentsById = async (req, res) => {
  const { doctorId } = req.params;

  try {
    const doctorExists = await Doctor.findById(doctorId);
    if (!doctorExists) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("patient", "name email") ; 
     

    return res.json(appointments);
  } catch (error) {
    console.error("Error fetching doctor's appointments:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


module.exports={
        bookAppointment,
        getMyAppointments,
        updateStatus,
        getDoctorAppointmentsById
      }