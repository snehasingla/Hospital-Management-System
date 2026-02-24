const User = require('../models/User');

// Get doctor's profile
const getDoctorProfile = async (req, res) => {

  // console.log('req.user:', req.user);

  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User is not authenticated' });
    }
    // Find the doctor using the user ID from the JWT token
    const doctor = await User.findById(req.user.id);

    // Log to check if doctor is null or undefined
    // console.log('Doctor from database:', doctor);

    // Ensure the logged-in user is a doctor
    if (doctor.role !== 'doctor') {
      return res.status(403).json({ message: 'This user is not a doctor' });
    }

    // Return doctor profile details
    const doctorProfile = {
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization,
      totalPatients: doctor.totalPatients,
      totalAppointments: doctor.totalAppointments
    };

    res.json(doctorProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching doctor profile' });
  }
};

module.exports = { getDoctorProfile };

