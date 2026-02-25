require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const applicationRoutes = require('./routes/applications');

// Middlewares
app.use(cors());
app.use(express.json());

// Main API Routes
app.use('/api/applications', applicationRoutes);

// Basic Route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to UniTrack API' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
