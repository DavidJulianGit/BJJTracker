const Tag = require('../models/Tag');
const Technique = require('../models/Technique');
const defaultTags = require('../Seeds/BJJTracker.tags.json');
const defaultTechniques = require('../Seeds/BJJTracker.techniques.json');

const ensureUserData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if user has any tags
    const userTags = await Tag.find({ user: userId });
    if (userTags.length === 0) {
      // Create default tags for the user
      const newTags = await Promise.all(defaultTags.map(async (tagData) => {
        const newTag = new Tag({
          name: tagData.name,
          user: userId,
          isDefault: true
        });
        await newTag.save();
        return newTag;
      }));

      console.log(`Created ${newTags.length} tags for user ${userId}`);

      // Create a map of tag names to their new IDs
      const tagNameToIdMap = newTags.reduce((map, tag) => {
        map[tag.name] = tag._id;
        return map;
      }, {});

      // Create default techniques for the user
      const createdTechniques = await Promise.all(defaultTechniques.map(async (techData) => {
        // Map the tag names to the newly created tag IDs
        const techTags = techData.tags.map(tagName => tagNameToIdMap[tagName]).filter(id => id);
        
        const newTechnique = new Technique({
          name: techData.name,
          description: techData.description || "",
          user: userId,
          isDefault: true,
          tags: techTags
        });
        await newTechnique.save();
        return newTechnique;
      }));

      console.log(`Created ${createdTechniques.length} techniques for user ${userId}`);
    }

    next();
  } catch (error) {
    console.error('Error in ensureUserData middleware:', error);
    next(error);
  }
};

module.exports = ensureUserData;