// models/Technique.js
const mongoose = require('mongoose');
require('./Tag');

const TechniqueSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isDefault: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
});

module.exports = mongoose.model('Technique', TechniqueSchema);