const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const TrainingSession = require('../models/TrainingSession');
const User = require('../models/User');

// GET all training sessions for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching training sessions for user:', req.user.id);
    
    const trainingSessions = await TrainingSession.find({ user: req.user.id })
      .populate('techniques.technique')
      .populate('tags');
    console.log('Found training sessions for user:', trainingSessions);

    res.json(trainingSessions);
  } catch (err) {
    console.error('Error in GET /api/trainingSessions:', err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// POST a new training session
router.post('/', auth, async (req, res) => {
  try {
    const { date, time, totalDuration, techniques, note, tags } = req.body;
    const newSession = new TrainingSession({
      user: req.user.id,
      date,
      time,
      totalDuration,
      techniques: techniques.map(tech => ({
        technique: tech.technique,
        duration: tech.duration,
        repetitions: tech.repetitions
      })),
      note,
      tags
    });
    const savedSession = await newSession.save();
    const populatedSession = await TrainingSession.findById(savedSession._id)
      .populate('techniques.technique')
      .populate('tags');
    res.json(populatedSession);
  } catch (err) {
    console.error(err);
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
    res.status(500).send('Server Error');
  }
});

// UPDATE a training session
router.put('/:id', auth, async (req, res) => {
  try {
    const { date, time, totalDuration, techniques, note, tags } = req.body;
    let session = await TrainingSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ msg: 'Training session not found' });
    }
    session.date = date;
    session.time = time;
    session.totalDuration = totalDuration;
    session.techniques = techniques;
    session.note = note;
    session.tags = tags;
    await session.save();
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// DELETE a training session
router.delete('/:id', auth, async (req, res) => {
  try {
    const session = await TrainingSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ msg: 'Training session not found' });
    }
    
    await session.remove();
    res.json({ msg: 'Training session removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;