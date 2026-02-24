const User = require('../models/User');
const Appointment = require('../models/Appointment');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Get users by role
const getUsersByRole = async (req, res) => {
  const { role } = req.params;

  try {
    const users = await User.find({ role }).select('-password');
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Get all appointments (admin view)
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialization')
      .sort({ date: -1 });

    res.status(200).json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalAppointments = await Appointment.countDocuments();
    
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const rejectedAppointments = await Appointment.countDocuments({ status: 'rejected' });

    res.status(200).json({
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAppointments,
      confirmedAppointments,
      pendingAppointments,
      rejectedAppointments,
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Also delete their appointments
    if (user.role === 'patient') {
      await Appointment.deleteMany({ patientId: userId });
    } else if (user.role === 'doctor') {
      await Appointment.deleteMany({ doctorId: userId });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  try {
    if (!['patient', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

module.exports = {
  getAllUsers,
  getUsersByRole,
  getAllAppointments,
  getDashboardStats,
  deleteUser,
  updateUserRole,
};
