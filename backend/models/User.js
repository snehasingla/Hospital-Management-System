const mongoose = require('mongoose');

// Create the user schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,  // Storing hashed password
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  specialization: {
    type: String,
    required: function () {
      return this.role === 'doctor';
    }
  },
  // Optional patient-specific fields
  age: { type: Number },
  gender: { type: String },
  phone: { type: String },
  address: { type: String },
  medicalHistory: { type: [String], default: [] },
  allergies: { type: [String], default: [] },
  bloodGroup: { type: String },
  totalPatients: { 
    type: Number, 
    default: 0, 
    required: function() {
      return this.role === 'doctor'; // Only relevant for doctors
    }
  },
  totalAppointments: { 
    type: Number, 
    default: 0, 
    required: function() {
      return this.role === 'doctor'; // Only relevant for doctors
    }
  },
  diseasesTreated: {
    type: [String],
    default: [],
    required: function () {
      return this.role === 'doctor';
    }
  }
});

// Export the User model
module.exports = mongoose.model('User', userSchema);
