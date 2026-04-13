const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, pin, loginMode, role, phone, city } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) return res.status(400).json({ message: 'An account with this email already exists. Please login instead.' });

    const userData = {
      name,
      email: email.toLowerCase().trim(),
      role: role || 'patient',
      phone: phone || '',
      city: city || '',
      loginMode: loginMode || 'password',
    };

    // Handle different login modes
    if (loginMode === 'pin') {
      if (!pin || pin.length !== 4) return res.status(400).json({ message: 'Please provide a 4-digit PIN' });
      userData.pin = pin;
    } else if (loginMode === 'email') {
      // Email-only login — no password needed
      userData.password = '';
    } else {
      // Default: password login
      if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
      userData.password = password;
    }

    const user = await User.create(userData);
    
    const dashMap = { patient: '/dashboard', lab: '/lab-dashboard', doctor: '/doctor-dashboard', hospital: '/hospital-dashboard' };
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      city: user.city,
      loginMode: user.loginMode,
      token: generateToken(user._id),
      redirectTo: dashMap[user.role] || '/dashboard',
    });
  } catch (error) {
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password, pin, loginMode } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: 'No account found with this email' });

    let authenticated = false;
    const mode = loginMode || user.loginMode || 'password';

    if (mode === 'email') {
      // Email-only login — just email is enough
      authenticated = true;
    } else if (mode === 'pin') {
      if (!pin) return res.status(400).json({ message: 'Please enter your 4-digit PIN' });
      authenticated = await user.matchPin(pin);
      if (!authenticated) return res.status(401).json({ message: 'Invalid PIN' });
    } else {
      // Password login
      if (!password) return res.status(400).json({ message: 'Please enter your password' });
      authenticated = await user.matchPassword(password);
      if (!authenticated) return res.status(401).json({ message: 'Invalid password' });
    }

    const dashMap = { patient: '/dashboard', lab: '/lab-dashboard', doctor: '/doctor-dashboard', hospital: '/hospital-dashboard' };

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      city: user.city,
      loginMode: user.loginMode,
      token: generateToken(user._id),
      redirectTo: dashMap[user.role] || '/dashboard',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -pin');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Restrict what can be updated
    const { name, phone, city, age, gender, bloodGroup, address, medicalHistory } = req.body;
    
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (city !== undefined) user.city = city;
    if (age !== undefined) user.age = age;
    if (gender !== undefined) user.gender = gender;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (address !== undefined) user.address = address;
    if (medicalHistory !== undefined) user.medicalHistory = medicalHistory;

    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      city: updatedUser.city,
      age: updatedUser.age,
      gender: updatedUser.gender,
      bloodGroup: updatedUser.bloodGroup,
      address: updatedUser.address,
      medicalHistory: updatedUser.medicalHistory,
      loginMode: updatedUser.loginMode,
      token: generateToken(updatedUser._id) // Refreshing token ensures long-lived session state alignment (optional, but helpful)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
