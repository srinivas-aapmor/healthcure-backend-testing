const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: String, // changed from fullName
  email: { type: String, unique: true },
  password: String,
  specialization: String,
  phone: String,
  experience: Number,
  fee: Number, // changed from consultationFee
  degrees: String,
  address: String, // changed from clinicAddress
  from: String, // changed from availableFrom
  to: String, // changed from availableTo
  bio: String,
  role: { type: String, default: "doctor" }, // add role field
  availability: [{ type: String }], // add availability as array of date strings
  timeSlots: [{ type: String }], // add timeSlots as array of time strings (e.g., '09:00-09:30')
});

module.exports = mongoose.model("doctor", doctorSchema);
