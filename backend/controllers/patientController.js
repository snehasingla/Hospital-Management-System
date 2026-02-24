const User = require('../models/User');

// Get patient's profile
const getPatientProfile = async (req, res) => {
  try {
  // JWT payload uses `id` when the token is issued in authController.
  console.log('patientController: req.user =', req.user);
  const userId = req.user?.id || req.user?._id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User is not authenticated' });
    }

  // Find the patient using the user ID from the JWT token
  const patient = await User.findById(userId);
  console.log('patientController: found patient =', patient);

    // Ensure the logged-in user is a patient
    if (patient.role !== 'patient') {
      return res.status(403).json({ message: 'This user is not a patient' });
    }

    // Return patient profile details
    const patientProfile = {
      _id: patient._id,  // Ensure you send the patient ID
      name: patient.name,
      email: patient.email,
      // include additional patient info
      age: patient.age || null,
      gender: patient.gender || null,
      phone: patient.phone || null,
      address: patient.address || null,
      medicalHistory: patient.medicalHistory || [],
      allergies: patient.allergies || [],
      bloodGroup: patient.bloodGroup || null,
      pastAppointments: patient.pastAppointments || [] // Assuming this info is in the model
    };

    res.json(patientProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching patient profile' });
  }
};

module.exports = { getPatientProfile };

// Update patient profile
const updatePatientProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'User is not authenticated' });

    const {
      name,
      age,
      gender,
      phone,
      address,
      bloodGroup,
      medicalHistory,
      allergies,
    } = req.body;

    const update = {};
    if (name) update.name = name;
    if (age !== undefined) update.age = age;
    if (gender) update.gender = gender;
    if (phone) update.phone = phone;
    if (address) update.address = address;
    if (bloodGroup) update.bloodGroup = bloodGroup;
    if (medicalHistory) update.medicalHistory = medicalHistory;
    if (allergies) update.allergies = allergies;

    const updated = await User.findByIdAndUpdate(userId, { $set: update }, { new: true });
    if (!updated) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile updated', user: updated });
  } catch (err) {
    console.error('Error updating patient profile:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

module.exports = { getPatientProfile, updatePatientProfile };
