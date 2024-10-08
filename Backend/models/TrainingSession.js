// models/TrainingSession.js

const mongoose = require('mongoose');

const TrainingSessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }, 
    totalDuration: { type: Number, required: true },
    techniques: [{
        duration: { type: Number, default: 0 },
        repetitions: { type: Number, default: 0 },
        technique: { type: mongoose.Schema.Types.ObjectId, ref: 'Technique' }
    }],
    note: String,
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
}, {
    timestamps: true
});

module.exports = mongoose.model('TrainingSession', TrainingSessionSchema);