const mongoose = require('mongoose');
const User = require('../models/User');
const Tag = require('../models/Tag');
const Technique = require('../models/Technique');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

async function updateTechniqueTags() {
  const users = await User.find();

  for (const user of users) {
    const userTags = await Tag.find({ user: user._id });
    const tagNameToIdMap = userTags.reduce((map, tag) => {
      map[tag.name] = tag._id;
      return map;
    }, {});

    const techniques = await Technique.find({ user: user._id });

    for (const technique of techniques) {
      const updatedTags = technique.tags
        .map(tagName => tagNameToIdMap[tagName])
        .filter(id => id);

      technique.tags = updatedTags;
      await technique.save();
    }
  }

  console.log('Technique tags updated successfully');
  mongoose.connection.close();
}

updateTechniqueTags();