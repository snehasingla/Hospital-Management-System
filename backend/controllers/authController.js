const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Signup function
async function signup(req, res) {
  try {
    const {
      name,
      email,
      password,
      role,
      specialization,
      diseasesTreated,
      // patient-specific
      age,
      gender,
      phone,
      address,
      medicalHistory,
      allergies,
      bloodGroup,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).send({ error: 'Please fill all fields' });
    }

    // Check if doctor is signing up but didn't provide specialization
    if (role === 'doctor' && !specialization) {
      return res.status(400).send({ error: 'Specialization is required for doctors' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      specialization: specialization || null,
      diseasesTreated: diseasesTreated || [],
      // patient-only fields (may be undefined)
      age,
      gender,
      phone,
      address,
      medicalHistory: medicalHistory || [],
      allergies: allergies || [],
      bloodGroup,
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).send({
      message: 'Signup successful',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        specialization: newUser.specialization,
        // return patient extras if available
        age: newUser.age,
        gender: newUser.gender,
        phone: newUser.phone,
        address: newUser.address,
        medicalHistory: newUser.medicalHistory,
        allergies: newUser.allergies,
        bloodGroup: newUser.bloodGroup,
      },
    });
  } catch (err) {
    res.status(500).send({ error: 'Server error during signup' });
  }
}

// Login function
function login(req, res) {
  const { email, password } = req.body;

  // Find the user by email
  User.findOne({ email }).then(function (user) {
    if (!user) {
      return res.status(400).send({ error: 'Invalid email or password' });
    }

    // Compare the password with the hashed password in the database
    bcrypt.compare(password, user.password, function (err, isMatch) {
      if (err || !isMatch) {
        return res.status(400).send({ error: 'Invalid email or password' });
      }

      // Generate token
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
        expiresIn: '7d',
      });

      // Send the token to the client
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          specialization: user.specialization || null,
        },
      });
    });
  }).catch(function (err) {
    res.status(500).send({ error: 'Server error during login' });
  });
}

module.exports = { signup, login };
