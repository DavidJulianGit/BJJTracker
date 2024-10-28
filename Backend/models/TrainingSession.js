// models/TrainingSession.js

const mongoose = require('mongoose');

const TrainingSessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }, 
    totalDuration: { type: Number, required: true },
    techniques: [{
        technique: { type: mongoose.Schema.Types.ObjectId, ref: 'Technique' },
        duration: Number,
        repetitions: Number
    }],
    note: String,  // Changed from 'notes' to 'note'
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
}, {
    timestamps: true
});

module.exports = mongoose.model('TrainingSession', TrainingSessionSchema);