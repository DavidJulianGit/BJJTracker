const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Tag = require('../models/Tag');

// Apply auth middleware to all routes
router.use(auth);

// GET all tags
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.find({ user: req.user.id });
    res.json(tags);
  } catch (err) {
    console.error('Error fetching tags:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST new tag
router.post('/', async (req, res) => {
  try {
    
    const { name } = req.body;
    console.log("name in POST /api/tags",name);
   
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    console.log("capitalizedName in POST /api/tags",capitalizedName);
    
    // Check if a tag with the same name already exists for this user
    const existingTag = await Tag.findOne({ name: capitalizedName, user: req.user.id });
    console.log("existingTag in POST /api/tags",existingTag);
    
    if (existingTag)
    {
      if (!existingTag.isDeleted) 
      {
        return res.status(400).json({ message: `A tag with name '${capitalizedName}' already exists.`});
      } 
      else
      {
        existingTag.isDeleted = false;
        const savedTag = await existingTag.save();
        res.status(201).json(savedTag);
      }
    }
    else{
      console.log("inside else in POST /api/tags");
      const newTag = new Tag({ name: capitalizedName, user: req.user.id });
      console.log("newTag in POST /api/tags",newTag);
      const savedTag = await newTag.save();
      console.log("savedTag in POST /api/tags",savedTag);
      res.status(201).json(savedTag);
    }

  } catch (err) {
    console.error('Error in POST /api/tags:', err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// PUT update tag
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    const tagId = req.params.id;

    let tag = await Tag.findOne({ _id: tagId, user: req.user.id });
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    // Check if a tag with the same name already exists for this user
    const existingTag = await Tag.findOne({ name: capitalizedName, user: req.user.id, _id: { $ne: tagId } });
    if (existingTag) {
      return res.status(400).json({ message: `A tag with name '${capitalizedName}' already exists.`});
    }

    tag.name = capitalizedName;
    await tag.save();

    res.json(tag);
  } catch (err) {
    console.error('Error in PUT /api/tags/:id:', err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// DELETE tag
router.delete('/:id', async (req, res) => {
  try {
    const tagId = req.params.id;

    const tag = await Tag.findOneAndUpdate({ _id: tagId, user: req.user.id }, { isDeleted: true });
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json({ msg: 'Tag soft deleted' });
  } catch (err) {
    console.error('Error in DELETE /api/tags/:id:', err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

module.exports = router;
