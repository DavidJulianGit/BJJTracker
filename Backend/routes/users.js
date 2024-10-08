const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
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

  const { username, birthday, rank, stripes } = req.body;
  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ msg: 'User not found' });
    }

    user.username = username || user.username;
    user.birthday = birthday || user.birthday;
    user.rank = rank || user.rank;
    user.stripes = stripes || user.stripes;

    await user.save();
    console.log('User updated successfully');
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

module.exports = router;