const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Tag = require('../models/Tag');

// Load the .env file from the backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Liste der Tags, die eingefügt werden sollen
const tags = [
    { name: 'Gi' },
    { name: 'No-Gi' },
    { name: 'Submission' },
    { name: 'Guard' },
    { name: 'Pass' },
    { name: 'Sweep' },
    { name: 'Escape' },
    { name: 'Takedown' },
    { name: 'Control' },
    { name: 'Defense' },
    { name: 'Attack' },
    { name: 'Transition' },
    { name: 'Pressure' },
    { name: 'Speed' },
    { name: 'Strategy' },
    { name: 'Positioning' },
    { name: 'Drills' },
    { name: 'Fundamentals' },
    { name: 'Advanced' },
    { name: 'Competition' },
    { name: 'Leglock' },
    { name: 'Tight Passing' },
    { name: 'Loose Passing' },
    { name: 'Armlock' },
    { name: 'Shoulderlock' },
    { name: 'Choke' },
    { name: 'Compression Lock' },
    { name: 'Kneebar' },
    { name: 'Heel Hook' },
    { name: 'Positional Control' },
    { name: 'Reversal' },
    { name: 'Scramble' },
    { name: 'Wrestling' },
    { name: 'Judo' },
    { name: 'Grip Fighting' },
    { name: 'Pressure Passing' },
    { name: 'Flow Passing' },
    { name: 'Guard Retention' },
    { name: 'Baiting' },
    { name: 'Counter' }
];

async function seedTags() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI is not defined in the .env file');
        process.exit(1);
    }

    console.log('MONGODB_URI:', uri); // Log the URI to verify it's loaded correctly

    try {
        await mongoose.connect(uri);
        console.log('MongoDB connected successfully');

        for (const tag of tags) {
            await Tag.findOneAndUpdate(
                { name: tag.name },
                { $setOnInsert: tag },
                { upsert: true, new: true }
            );
        }
        console.log('Tags erfolgreich hinzugefügt oder aktualisiert!');
    } catch (error) {
        console.error('Fehler:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

seedTags();