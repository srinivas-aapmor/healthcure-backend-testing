const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctors', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('appointments', appointmentSchema);
