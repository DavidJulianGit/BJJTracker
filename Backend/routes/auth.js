// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const TrainingSession = require('../models/TrainingSession');
const Technique = require('../models/Technique');
const Tag = require('../models/Tag');

// POST /api/auth/signup

router.post('/signup', async (req, res) => {
    try {
      const { email, password, username, birthday, rank, stripes } = req.body;
      
      console.log('Attempting to find user with email:', email);
      let user = await User.findOne({ email });
      console.log('Result of user search:', user);

      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      user = new User({
        email,
        password: hashedPassword,
        username,
        birthday,
        rank,
        stripes
      
      });
  
      await user.save();
  
      const payload = {
        user: {
          id: user.id
        }
      };
  
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            birthday: user.birthday,
            rank: user.rank,
            stripes: user.stripes
          }
        });
      });
    } catch (err) {
      console.error('Error in signup:', err);
      res.status(500).send('Server error');
    }
  });
  
  // POST /api/auth/login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }
  
      const payload = {
        user: {
          id: user.id
        }
      };
  
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            birthday: user.birthday,
            rank: user.rank,
            stripes: user.stripes
          }
        });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
  
  module.exports = router;

// routes/users.js
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, birthday, rank, stripes } = req.body;
    const userId = req.user.id;

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.username = username || user.username;
    user.birthday = birthday || user.birthday;
    user.rank = rank || user.rank;
    user.stripes = stripes || user.stripes;

    await user.save();

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        birthday: user.birthday,
        rank: user.rank,
        stripes: user.stripes
      }
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).send('Server error');
  }
});

// routes/trainingSessions.js
router.post('/training-session', auth, async (req, res) => {
  try {
    const { date, duration, techniques, notes } = req.body;
    const userId = req.user.id;

    const newSession = new TrainingSession({
      user: userId,
      date,
      duration,
      techniques,
      notes
    });

    await newSession.save();

    res.json(newSession);
  } catch (err) {
    console.error('Error adding training session:', err);
    res.status(500).send('Server error');
  }
});

router.put('/training-session/:id', auth, async (req, res) => {
  try {
    const { date, duration, techniques, notes } = req.body;
    const sessionId = req.params.id;
    const userId = req.user.id;

    let session = await TrainingSession.findOne({ _id: sessionId, user: userId });
    if (!session) {
      return res.status(404).json({ msg: 'Training session not found' });
    }

    session.date = date || session.date;
    session.duration = duration || session.duration;
    session.techniques = techniques || session.techniques;
    session.notes = notes || session.notes;

    await session.save();

    res.json(session);
  } catch (err) {
    console.error('Error updating training session:', err);
    res.status(500).send('Server error');
  }
});

router.delete('/training-session/:id', auth, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const userId = req.user.id;

    const session = await TrainingSession.findOneAndDelete({ _id: sessionId, user: userId });
    if (!session) {
      return res.status(404).json({ msg: 'Training session not found' });
    }

    res.json({ msg: 'Training session deleted' });
  } catch (err) {
    console.error('Error deleting training session:', err);
    res.status(500).send('Server error');
  }
});

// Implement similar routes for techniques and tags
router.post('/technique', auth, async (req, res) => {
  try {
    const { name, description, tags } = req.body;
    const userId = req.user.id;

    const newTechnique = new Technique({
      user: userId,
      name,
      description,
      tags
    });

    await newTechnique.save();

    res.json(newTechnique);
  } catch (err) {
    console.error('Error adding technique:', err);
    res.status(500).send('Server error');
  }
});

router.put('/technique/:id', auth, async (req, res) => {
  // Similar to updating training session
});

router.delete('/technique/:id', auth, async (req, res) => {
  // Similar to deleting training session
});

router.post('/tag', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const newTag = new Tag({
      user: userId,
      name
    });

    await newTag.save();

    res.json(newTag);
  } catch (err) {
    console.error('Error adding tag:', err);
    res.status(500).send('Server error');
  }
});

router.put('/tag/:id', auth, async (req, res) => {
  // Similar to updating technique
});

router.delete('/tag/:id', auth, async (req, res) => {
  // Similar to deleting technique
});

module.exports = router;