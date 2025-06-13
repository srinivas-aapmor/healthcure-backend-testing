const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  specialization: String,
  phone: String,
  experience: Number,
  consultationFee: Number,
  degrees: String,
  clinicAddress: String,
  availableFrom: String,
  availableTo: String,
  bio: String,
});


doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("doctor", doctorSchema);
