const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: String, 
  email: { type: String, unique: true },
  password: String,
  specialization: String,
  phone: String,
  experience: Number,
  fee: Number, 
  degrees: String,
  address: String, 
  from: String, 
  to: String, 
  bio: String,
  role: { type: String, default: "doctor" }, 
  availability: [{ type: String }], 
  timeSlots: [{ type: String }],
});

module.exports = mongoose.model("Doctor", doctorSchema);
