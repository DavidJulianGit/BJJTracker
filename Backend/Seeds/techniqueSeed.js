const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Technique = require('../models/Technique');

// Load the .env file from the backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const techniques = [
    
        
]

async function seedTechniques() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not defined in the .env file');
    process.exit(1);
  }

  console.log('MONGODB_URI:', uri); // Log the URI to verify it's loaded correctly

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');

    for (const technique of techniques) {
      await Technique.findOneAndUpdate(
        { name: technique.name },
        { $setOnInsert: technique },
        { upsert: true, new: true }
      );
    }
    console.log('Techniques successfully added or updated!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

seedTechniques();
