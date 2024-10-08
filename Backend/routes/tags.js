const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Tag = require('../models/Tag');

// GET all tags
router.get('/', auth, async (req, res) => {
  console.log('GET /api/tags');
  try {
    const tags = await Tag.find();
    console.log('Tags found:', tags);
    res.json(tags);
  } catch (err) {
    console.error('Error in GET /api/tags:', err);
    res.status(500).json({ error: 'Server Error', message: err.message, stack: err.stack });
  }
});

// POST new tag
router.post('/', auth, async (req, res) => {
  console.log('POST /api/tags');
  try {
    const { name } = req.body;
    const newTag = new Tag({ name });
    const savedTag = await newTag.save();
    console.log('New tag created:', savedTag);
    res.status(201).json(savedTag);
  } catch (err) {
    console.error('Error in POST /api/tags:', err);
    res.status(500).json({ error: 'Server Error', message: err.message, stack: err.stack });
  }
});

// PUT update tag
router.put('/:id', auth, async (req, res) => {
  console.log('PUT /api/tags/:id');
  try {
    const { name } = req.body;
    const tagId = req.params.id;

    // Check if the tag exists
    let tag = await Tag.findById(tagId);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    // Update the tag
    tag.name = name;
    await tag.save();

    console.log('Updated tag:', tag);
    res.json(tag);
  } catch (err) {
    console.error('Error in PUT /api/tags/:id:', err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// DELETE tag
router.delete('/:id', auth, async (req, res) => {
  console.log('DELETE /api/tags/:id');
  try {
    const tagId = req.params.id;

    // Attempt to find and delete the tag
    const tag = await Tag.findByIdAndDelete(tagId);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    console.log('Tag removed:', tagId);
    res.json({ msg: 'Tag removed' });
  } catch (err) {
    console.error('Error in DELETE /api/tags/:id:', err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

module.exports = router;