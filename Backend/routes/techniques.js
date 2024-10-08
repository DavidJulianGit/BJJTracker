const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Technique = require('../models/Technique');
const Tag = require('../models/Tag');

// GET all techniques
router.get('/', auth, async (req, res) => {
  try {
    const techniques = await Technique.find().populate('tags', 'name');
    res.json(techniques);
  } catch (err) {
    console.error('Error in GET /api/techniques:', err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// POST new technique
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, tags } = req.body;
    const newTechnique = new Technique({ name, description, tags });
    const savedTechnique = await newTechnique.save();
    res.status(201).json(savedTechnique);
  } catch (err) {
    console.error('Error in POST /api/techniques:', err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// GET a specific technique by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const technique = await Technique.findById(req.params.id).populate('tags', 'name');
    if (!technique) {
      return res.status(404).json({ error: 'Technique not found' });
    }
    res.json(technique);
  } catch (err) {
    console.error('Error in GET /api/techniques/:id:', err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// PUT update technique
router.put('/:id', auth, async (req, res) => {
  try {
    const updatedTechnique = await Technique.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTechnique) {
      return res.status(404).json({ message: 'Technique not found' });
    }
    // Populate the tags field with the full tag objects
    const populatedTechnique = await updatedTechnique.populate('tags', 'name');
    res.json(populatedTechnique);
    
  } catch (error) {
    console.error('Error updating technique:', error); 
    res.status(500).json({ message: error.message });
  }
});

// DELETE technique
router.delete('/:id', auth, async (req, res) => {
  try {
    const techniqueId = req.params.id;
    const technique = await Technique.findByIdAndDelete(techniqueId);
    if (!technique) {
      return res.status(404).json({ error: 'Technique not found' });
    }
    res.json({ msg: 'Technique removed' });
  } catch (err) {
    console.error('Error in DELETE /api/techniques/:id:', err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

module.exports = router;