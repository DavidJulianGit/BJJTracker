// models/Technique.js
const mongoose = require('mongoose');
require('./Tag');

const TechniqueSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false }, 
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }] // Array of tags
});

module.exports = mongoose.model('Technique', TechniqueSchema);