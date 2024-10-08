const express = require('express');
const connectDB = require('./config/database');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Connect Database
connectDB();

// CORS Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Allow only the frontend URL
  credentials: true, // Allow cookies if needed
}));

// Init Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/techniques', require('./routes/techniques'));
app.use('/api/tags', require('./routes/tags'));
app.use('/api/trainingSessions', require('./routes/trainingSessions'));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// The "catchall" handler: for any request that doesn't match one above, send back index.html.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
})
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log('MongoDB connection error:', err));