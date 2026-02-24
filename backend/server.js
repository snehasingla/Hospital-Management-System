const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server: SocketServer } = require('socket.io');
require('dotenv').config();

const authController = require('./controllers/authController');
const doctorController = require('./controllers/doctorController');
const patientController = require('./controllers/patientController');
const adminController = require('./controllers/adminController');
const notificationController = require('./controllers/notificationController');
const { authenticateJWT, authorizeRole } = require('./middleware/authmiddleware');
const { searchDoctors, getAllSpecializations } = require('./controllers/doctorSearchController');
const appointmentController = require('./controllers/appointmentController');

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
  },
});

// Store connected users for real-time notifications
const connectedUsers = new Map();

// Middleware to parse JSON requests
// Configure CORS. In development allow the Vite dev ports (5173 and 5174).
// You can override allowed origin with the CORS_ORIGIN environment variable.
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, postman) or if origin is in our list
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: This origin is not allowed'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.use(express.json());

// Routes for login and signup
app.post('/signup', function (req, res) {
  // console.log(req.body);
  authController.signup(req, res);
});

app.post('/login', function (req, res) {
  authController.login(req, res);
});

// Doctor Profile Route - Only accessible if user is a doctor
app.get('/api/doctor/profile', authenticateJWT, authorizeRole('doctor'), doctorController.getDoctorProfile);

// Patient Profile Route - Only accessible if user is a patient
app.get('/api/patient/profile', authenticateJWT, authorizeRole('patient'), patientController.getPatientProfile);
// Update patient profile - Only accessible if user is a patient
app.patch('/api/patient/profile', authenticateJWT, authorizeRole('patient'), patientController.updatePatientProfile);

app.get('/api/doctors/search', searchDoctors);

// Get all unique specializations
app.get('/api/specializations', getAllSpecializations);

// Appointment Booking Route - Only accessible if user is a patient
app.post('/api/appointments/book', authenticateJWT, authorizeRole('patient'), appointmentController.bookAppointment); // New route for booking appointments

// Doctor gets all his appointments - Only accessible if user is a doctor
app.get('/api/doctor/appointments', authenticateJWT, authorizeRole('doctor'), appointmentController.getDoctorAppointments);

// Doctor updates appointment - Only accessible if user is a doctor
app.patch('/api/doctor/appointments/update/:id', authenticateJWT, authorizeRole('doctor'), appointmentController.updateAppointment);

app.get('/api/doctor/stats', authenticateJWT, authorizeRole('doctor'), appointmentController.getDoctorStats);

// Patient gets all his appointments - Only accessible if user is a patient
app.get('/api/patient/appointments', authenticateJWT, authorizeRole('patient'), appointmentController.getPatientAppointments);

// ==================== NOTIFICATION ROUTES ====================
app.get('/api/notifications', authenticateJWT, notificationController.getUserNotifications);
app.patch('/api/notifications/:notificationId/read', authenticateJWT, notificationController.markAsRead);
app.patch('/api/notifications/read-all', authenticateJWT, notificationController.markAllAsRead);
app.get('/api/notifications/unread-count', authenticateJWT, notificationController.getUnreadCount);

// ==================== ADMIN ROUTES ====================
app.get('/api/admin/users', authenticateJWT, authorizeRole('admin'), adminController.getAllUsers);
app.get('/api/admin/users/:role', authenticateJWT, authorizeRole('admin'), adminController.getUsersByRole);
app.get('/api/admin/appointments', authenticateJWT, authorizeRole('admin'), adminController.getAllAppointments);
app.get('/api/admin/dashboard', authenticateJWT, authorizeRole('admin'), adminController.getDashboardStats);
app.delete('/api/admin/users/:userId', authenticateJWT, authorizeRole('admin'), adminController.deleteUser);
app.patch('/api/admin/users/:userId/role', authenticateJWT, authorizeRole('admin'), adminController.updateUserRole);

// ==================== SOCKET.IO EVENTS ====================
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // User joins their notification room
  socket.on('join', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their notification room`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    connectedUsers.forEach((value, key) => {
      if (value === socket.id) {
        connectedUsers.delete(key);
      }
    });
    console.log('User disconnected:', socket.id);
  });
});

// Function to send real-time notification
global.sendNotification = (userId, notification) => {
  io.to(`user_${userId}`).emit('notification', notification);
};

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(function () {
    console.log('MongoDB connected');
    app.listen(5000, function () {
      console.log('Server running on port 5000');
    });
  })
  .catch(function (err) {
    console.log('Error connecting to MongoDB:', err);
  });
