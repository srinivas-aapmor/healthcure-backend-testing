// const mongoose = require("mongoose");

// const appointmentSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },
//   doctorId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Doctor",
//     required: true
//   },
//   appointmentDate: {
//     type: Date,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ["pending", "confirmed", "cancelled", "completed","scheduled"],
//     default: "pending"
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   notes: {
//   type: String,
//   default: ""
// }

// });

// module.exports = mongoose.model("Appointment", appointmentSchema);
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    consultationType: {
      type: String,
      enum: ["Online", "In-Person"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
