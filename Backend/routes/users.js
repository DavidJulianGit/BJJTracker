const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT /api/users/me
router.put('/me', auth, async (req, res) => {
  console.log('Received update request');
  console.log('User ID from token:', req.user.id);
  console.log('Request body:', req.body);

  const { username, email, rank, stripes } = req.body;
  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ msg: 'User not found' });
    }

    console.log('Current user data:', user);

    user.username = username || user.username;
    user.email = email || user.email;
    user.rank = rank || user.rank;
    user.stripes = stripes !== undefined ? stripes : user.stripes;

    console.log('Updated user data before save:', user);

    await User.findByIdAndUpdate(
      req.user.id,
      { $set: { username, email, rank, stripes } },
      { new: true, runValidators: true }
    );

    console.log('User updated successfully');
    console.log('Final user data:', user);
    res.json(user);
  } catch (err) {
    console.error('Error in update route:', err);
    res.status(500).send('Server Error');
  }
});

router.post('/change-password', auth, async (req, res) => {
  console.log('Received password change request');
  console.log('User ID from token:', req.user.id);

  const { newPassword } = req.body;
  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ msg: 'User not found' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    console.log('Password updated successfully');
    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error('Error in password change route:', err);
    res.status(500).send('Server Error');
  }
});

// DELETE /api/users/me
router.delete('/me', auth, async (req, res) => {
  console.log('Received delete account request');
  console.log('User ID from token:', req.user.id);

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ msg: 'User not found' });
    }

    await User.findByIdAndDelete(req.user.id);
    console.log('User account deleted successfully');
    res.json({ msg: 'User account deleted successfully' });
  } catch (err) {
    console.error('Error in delete account route:', err);
    res.status(500).send('Server Error');
  }
});

// POST /api/users (Create a new user)
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, rank, stripes } = req.body;
    console.log('Received signup request:', { username, email, rank, stripes });

    // Create new user
    const user = new User({
      username,
      email,
      password,
      rank,
      stripes
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    console.log('Trying to save user:', user);
    await user.save();
    console.log('User created successfully:', user);

    res.status(201).json({ user: user });
    
  } catch (err) {
    console.error('Error in signup:', err);
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt for:', email);

  try {
    let user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    console.log('User found:', user);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        console.log('Login successful for:', email);
        res.json({ token, user: { id: user.id, email: user.email, username: user.username, rank: user.rank, stripes: user.stripes } });
      }
    );
  } catch (err) {
    console.error('Error in login:', err);
    res.status(500).send('Server error');
  }
});

// POST /api/users/verify-token
router.get('/verify-token', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, userId: decoded.user.id });
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
});

module.exports = router;
