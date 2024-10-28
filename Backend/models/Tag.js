const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isDefault: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
});

module.exports = mongoose.model('Tag', TagSchema);