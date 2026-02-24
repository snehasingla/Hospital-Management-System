const Appointment = require('../models/Appointment');
const User = require('../models/User'); // Assuming User model for both patient and doctor

// Function to handle booking an appointment
const bookAppointment = async (req, res) => {
  const { doctorId, date, time } = req.body;
  const patientId = req.user?.id || req.user?._id; // JWT payload set in auth middleware

  if (!doctorId || !date || !time) {
    return res.status(400).json({ message: 'Please provide doctorId, date, and time' });
  }

  try {
    // Check if the patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if the doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found or invalid doctorId' });
    }

    // Create and save the appointment
    const newAppointment = new Appointment({
      patientId,
      doctorId,
      date: new Date(date),
      time,
    });

    await newAppointment.save();

    // Create notification for doctor
    const Notification = require('../models/Notification');
    const doctorNotification = new Notification({
      userId: doctorId,
      type: 'appointment_booked',
      title: 'New Appointment Booked',
      message: `${patient.name} has booked an appointment with you`,
      appointmentId: newAppointment._id,
    });
    
    await doctorNotification.save();
    
    // Send real-time notification via Socket.io
    if (global.sendNotification) {
      global.sendNotification(doctorId.toString(), doctorNotification);
    }

    // Return success message with appointment details
    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: newAppointment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred while booking the appointment' });
  }
};



const getDoctorAppointments = async (req, res) => {
  const doctorId = req.user?.id || req.user?._id;

  try {
    const appointments = await Appointment.find({ doctorId })
      .sort({ date: 1 })
      .populate('patientId', 'name email phone age'); // Populate patient details

    res.status(200).json({ appointments });
  } catch (err) {
    console.error('Error fetching doctor appointments:', err);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
};

const updateAppointment = async (req, res) => {
  const doctorId = req.user?.id || req.user?._id;
  const appointmentId = req.params.id;
  const { status, newDate, newTime, rescheduleMessage } = req.body;

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.doctorId.toString() !== doctorId) {
      return res.status(403).json({ message: 'Unauthorized to update this appointment' });
    }

    const Notification = require('../models/Notification');
    
    if (status) {
      appointment.status = status;
      
      // Create notification for patient
      const notificationMessage = status === 'confirmed' 
        ? 'Your appointment has been confirmed'
        : status === 'rejected'
        ? 'Your appointment has been rejected'
        : 'Your appointment has been rescheduled';
      
      const notification = new Notification({
        userId: appointment.patientId,
        type: `appointment_${status}`,
        title: `Appointment ${status}`,
        message: notificationMessage,
        appointmentId: appointment._id,
      });
      
      await notification.save();
      
      // Send real-time notification via Socket.io
      if (global.sendNotification) {
        global.sendNotification(appointment.patientId.toString(), notification);
      }
    }
    
    if (newDate) appointment.date = new Date(newDate);
    if (newTime) appointment.time = newTime;
    if (rescheduleMessage) appointment.rescheduleMessage = rescheduleMessage;

    await appointment.save();

    res.status(200).json({ message: 'Appointment updated successfully', appointment });
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ message: 'Failed to update appointment' });
  }
};

const getDoctorStats = async (req, res) => {
  const doctorId = req.user?.id || req.user?._id;  // Fixed: use correct user ID property

  try {
    const appointments = await Appointment.find({ doctorId });

    const totalAppointments = appointments.length;

    // Extract unique patient IDs
    const patientIds = [...new Set(appointments.map(appt => appt.patientId.toString()))];
    const totalPatients = patientIds.length;

    res.status(200).json({
      totalAppointments,
      totalPatients
    });
  } catch (err) {
    console.error("Error fetching doctor stats:", err);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

const getPatientAppointments = async (req, res) => {
  const patientId = req.user?.id || req.user?._id;

  try {
    const appointments = await Appointment.find({ patientId })
      .sort({ date: 1 })
      .populate('doctorId', 'name specialization');

    res.status(200).json({ appointments });
  } catch (err) {
    console.error('Error fetching patient appointments:', err);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
};


module.exports = {
  bookAppointment,
  getDoctorAppointments,
  getDoctorStats,
  getPatientAppointments,
  updateAppointment
};