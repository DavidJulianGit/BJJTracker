const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const TrainingSession = require('../models/TrainingSession');

// GET all training sessions for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    
    
    const trainingSessions = await TrainingSession.find({ user: req.user.id })
      .populate('techniques.technique')
      .populate('tags');
    

    res.json(trainingSessions);
  } catch (err) {
    console.error('Error in GET /api/trainingSessions:', err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// POST a new training session
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received training session data:', req.body);
    const { date, time, totalDuration, techniques, note, tags } = req.body;  // Changed 'notes' to 'note'
    const userId = req.user.id;

    if (!date || !time || totalDuration === undefined || totalDuration === '') {
      console.log('Validation failed:', { date, time, totalDuration });
      return res.status(400).json({ error: 'Bad Request', message: 'Date, time, and totalDuration are required fields' });
    }
    
    const newSession = new TrainingSession({
      user: userId,
      date,
      time,
      totalDuration: Number(totalDuration),
      techniques,
      note,  // Changed from 'notes' to 'note'
      tags
    });

    console.log('Created new session object:', newSession);

    const savedSession = await newSession.save();
    console.log('Saved training session:', savedSession);
    res.status(201).json(savedSession);
  } catch (err) {
    console.error('Error adding training session:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation Error', message: err.message });
    }
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// GET a specific training session
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await TrainingSession.findById(req.params.id)
      .populate('techniques.technique')
      .populate('tags');
    if (!session) {
      return res.status(404).json({ msg: 'Training session not found' });
    }
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// UPDATE a training session
router.put('/:id', auth, async (req, res) => {
  try {
    const { date, time, totalDuration, techniques, note, tags } = req.body;  // Changed 'notes' to 'note'
    const sessionId = req.params.id;
    const userId = req.user.id;

    let session = await TrainingSession.findOne({ _id: sessionId, user: userId });
    if (!session) {
      return res.status(404).json({ msg: 'Training session not found' });
    }

    session.date = date || session.date;
    session.time = time || session.time;
    session.totalDuration = totalDuration !== undefined ? Number(totalDuration) : session.totalDuration;
    session.techniques = techniques || session.techniques;
    session.note = note;  // Changed from 'notes' to 'note'
    session.tags = tags || session.tags;

    const updatedSession = await session.save();
    res.json(updatedSession);
  } catch (err) {
    console.error('Error updating training session:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation Error', message: err.message });
    }
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// DELETE a training session
router.delete('/:id', auth, async (req, res) => {
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
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

module.exports = router;