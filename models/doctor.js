const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  specialization: {
    type: String,
    required: true
  },
  experience: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    required: true
  },
  consultationFee: {
    type: Number,
    required: true
  },
  availableSlots: [
    {
      type: Date,
      required: true
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Doctor", doctorSchema);
