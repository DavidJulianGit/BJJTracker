const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ensureUserData = require('../middleware/ensureUserData');
const Technique = require('../models/Technique');

// Apply auth and ensureUserData middleware to all routes
router.use(auth, ensureUserData);

// GET all techniques
router.get('/', auth, async (req, res) => {
  try {
    const techniques = await Technique.find({ user: req.user.id }).populate('tags');
    res.json(techniques);
  } catch (err) {
    console.error('Error fetching techniques:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST new technique
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, tags } = req.body;
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    // Check if a technique with the same name exists for this user (whether deleted or not)
    const existingTechnique = await Technique.findOne({ name: capitalizedName, user: req.user.id });

    if (existingTechnique) {
      if (existingTechnique.isDeleted) {
        // Inform the frontend that a soft-deleted technique exists with the same name
        return res.status(409).json({ 
          message: `A technique with the name '${capitalizedName}' was previously deleted.`,
          existingTechniqueId: existingTechnique._id,
          conflict: true
        });
      } else {
        return res.status(400).json({ message: `A technique with name '${capitalizedName}' already exists.` });
      }
    }

    const newTechnique = new Technique({ name: capitalizedName, description, tags, user: req.user.id });
    const savedTechnique = await newTechnique.save();
    res.status(201).json(savedTechnique);
  } catch (err) {
    console.error('Error in POST /api/techniques:', err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// GET a specific technique by ID
router.get('/:id', async (req, res) => {
  try {
    const technique = await Technique.findOne({ _id: req.params.id, user: req.user.id }).populate('tags', 'name');
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
    const { name, description, tags } = req.body;
    const techniqueId = req.params.id;
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    // Check if the technique exists and belongs to the user
    let technique = await Technique.findOne({ _id: techniqueId, user: req.user.id });
    console.log("technique found in PUT /api/techniques/:id",technique);
    if (!technique) {
      return res.status(404).json({ message: 'Technique not found' });
    }

    // Check for name conflicts
    const existingTechnique = await Technique.findOne({ 
      name: capitalizedName, 
      user: req.user.id, 
      _id: { $ne: techniqueId } 
    });

    console.log("existingTechnique found in PUT /api/techniques/:id",existingTechnique);

    if (existingTechnique) {
      if (existingTechnique.isDeleted) {
        console.log("Soft-deleted technique with same name exists in PUT /api/techniques/:id");
        // Inform about soft-deleted conflict
        return res.status(409).json({
          message: `A technique with the name '${capitalizedName}' was previously deleted.`,
          existingTechniqueId: existingTechnique._id,
          editingTechniqueId: techniqueId,
          conflict: true,
          action: 'update_or_restore'
        });
      } else {
        // Active technique with same name exists
        console.log("Active technique with same name exists in PUT /api/techniques/:id");
        return res.status(400).json({ message: `A technique with name '${capitalizedName}' already exists.` });
      }
    }

    // Update the technique
    technique.name = capitalizedName;
    technique.description = description;
    technique.tags = tags;
    console.log("technique updated in PUT /api/techniques/:id",technique);
    const updatedTechnique = await technique.save();
    console.log("updatedTechnique found in PUT /api/techniques/:id",updatedTechnique);
    res.json(updatedTechnique);

  } catch (err) {
    console.error('Error in PUT /api/techniques/:id:', err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// DELETE technique
router.delete('/:id', async (req, res) => {
  try {
    const techniqueId = req.params.id;
    const technique = await Technique.findOneAndUpdate({ _id: techniqueId, user: req.user.id }, { isDeleted: true });
    if (!technique) {
      return res.status(404).json({ error: 'Technique not found' });
    }
    res.json({ msg: 'Technique soft deleted' });
  } catch (err) {
    console.error('Error in DELETE /api/techniques/:id:', err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// PUT /api/techniques/:id/restore - Restore a soft-deleted technique
router.put('/:id/restore', auth, async (req, res) => {
  try {
    const technique = await Technique.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id, isDeleted: true },
      { isDeleted: false },
      { new: false }
    );
    
    if (!technique) {
      return res.status(404).json({ message: 'Technique not found' });
    }
    console.log("technique found in PUT /api/techniques/:id/restore",technique);

    res.json(technique);
  } catch (err) {
    console.error('Error in PUT /api/techniques/:id/restore:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// PUT /api/techniques/:id/replace - Replace the technique's details while keeping the same ID
router.put('/:id/replace', auth, async (req, res) => {
  try {
    const { name, description, tags, idOfTechniqueToReplace, _id } = req.body;

    console.log("name, description, tags, idOfTechniqueToReplace, _id in PUT /api/techniques/:id/replace",name, description, tags, idOfTechniqueToReplace, _id);

    const technique = await Technique.findOneAndUpdate(
      { _id: idOfTechniqueToReplace, user: req.user.id },
      { name, description, tags, isDeleted: false },
      { new: false }
    );
    if (!technique) {
      return res.status(404).json({ message: 'Technique not found' });
    }
    console.log("saved technique in PUT /api/techniques/:id/replace",technique);
    res.json(technique);
  } catch (err) {
    console.error('Error in PUT /api/techniques/:id/replace:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
