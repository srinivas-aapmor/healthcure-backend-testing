
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
     slot: String,
    notes: {
      type: String,
      default: "",
    },
    cancellationReason: {
  type: String,
  default: "",
}

  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
