const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'eduportal_super_secret_jwt_key_2026';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static('.'));

// Admin Credentials (always works, mirrors the original admin system)
const ADMIN_CREDENTIALS = {
  email: 'admin@eduportal.com',
  password: 'admin123',
  user: {
    id: 'admin_user',
    email: 'admin@eduportal.com',
    name: 'Admin User',
    isAdmin: true
  }
};

// Database Connection
console.log('🔌 Connecting to MongoDB Atlas...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// JWT Auth Middleware
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authentication token, authorization denied' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.id === 'admin_user') {
      req.user = ADMIN_CREDENTIALS.user;
      req.isAdmin = true;
      return next();
    }
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid, user not found' });
    }
    
    req.user = user;
    req.isAdmin = false;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Token is not valid or has expired' });
  }
};

// --- AUTHENTICATION API ENDPOINTS ---

// Signup Route
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    
    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Save new user
    const newUser = new User({
      name,
      email,
      password: passwordHash
    });
    
    const savedUser = await newUser.save();
    
    // Generate JWT token
    const token = jwt.sign({ id: savedUser._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        dashboardData: savedUser.dashboardData
      }
    });
  } catch (error) {
    console.error('Signup API error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    
    // Check admin credentials first
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const token = jwt.sign({ id: 'admin_user' }, JWT_SECRET, { expiresIn: '1d' });
      return res.json({
        token,
        user: ADMIN_CREDENTIALS.user
      });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. User does not exist.' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Incorrect password.' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dashboardData: user.dashboardData
      }
    });
  } catch (error) {
    console.error('Login API error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get all registered users (names & emails)
app.get('/api/auth/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Mock Google Auth (logs in existing or registers new user and returns JWT token)
app.post('/api/auth/google-mock', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      // Create new user (using a mock password hash)
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('google_mock_password_' + Date.now(), salt);
      
      user = new User({
        name: name || email.split('@')[0],
        email,
        password: passwordHash
      });
      await user.save();
      console.log('✅ Created new Google mock user:', email);
    } else {
      console.log('✅ Found existing Google mock user:', email);
    }
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dashboardData: user.dashboardData
      }
    });
  } catch (error) {
    console.error('Google mock auth error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
});

// Get User Session (Verify JWT)
app.get('/api/auth/session', auth, async (req, res) => {
  if (req.isAdmin) {
    return res.json({ user: ADMIN_CREDENTIALS.user });
  }
  
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      dashboardData: req.user.dashboardData
    }
  });
});

// Mock Reset Password Route
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please enter your email' });
    }
    
    const user = await User.findOne({ email });
    if (!user && email !== ADMIN_CREDENTIALS.email) {
      return res.status(404).json({ message: 'No account found with this email' });
    }
    
    // Simulating sending recovery email
    res.json({ message: 'Password recovery email sent successfully! Please check your inbox.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

// --- DASHBOARD DATA SYNCING ENDPOINTS ---

// Get Dashboard Data
app.get('/api/user/dashboard', auth, async (req, res) => {
  if (req.isAdmin) {
    return res.json({ dashboardData: {} });
  }
  res.json({ dashboardData: req.user.dashboardData || {} });
});

// Save/Sync Dashboard Data
app.post('/api/user/dashboard', auth, async (req, res) => {
  try {
    if (req.isAdmin) {
      return res.status(400).json({ message: 'Admin dashboard state is not stored in MongoDB' });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.dashboardData = req.body;
    await user.save();
    
    res.json({ success: true, message: 'Dashboard synced successfully' });
  } catch (error) {
    console.error('Dashboard sync error:', error);
    res.status(500).json({ message: 'Server error syncing dashboard' });
  }
});

// Start Server
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 URL: http://localhost:${PORT}`);
  });
}

module.exports = app;
