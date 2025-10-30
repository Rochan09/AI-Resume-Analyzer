const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({ ok: false, error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ ok: false, error: 'Email already registered' });
    }

    // Create user
    const user = new User({ email, password, fullName });
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      ok: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        name: user.fullName,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ ok: false, error: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      ok: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        name: user.fullName,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ ok: false, error: 'Login failed' });
  }
});

// Get current user (protected route example)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ ok: false, error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    res.json({
      ok: true,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(401).json({ ok: false, error: 'Invalid token' });
  }
});

module.exports = router;
