const mongoose = require('mongoose');

// Create appointment schema
// const appointmentSchema = new mongoose.Schema({
//   patientId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   doctorId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'confirmed', 'completed', 'cancelled'],
//     default: 'pending'
//   }
// });

// models/Appointment.js

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rescheduled', 'rejected'],
    default: 'pending'
  },
  rescheduleMessage: {
    type: String,
    default: ''
  }
});


const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
