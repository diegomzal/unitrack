require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const applicationRoutes = require('./routes/applications');
const universityRoutes = require('./routes/universities');
const userRoutes = require('./routes/users');
const shareRoutes = require('./routes/shares');

// Middlewares
app.use(cors());
app.use(express.json());

// Public route for health check
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to UniTrack API' });
});

// All API routes require authentication
app.use('/api/applications', authenticate, applicationRoutes);
app.use('/api/universities', authenticate, universityRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/shares', authenticate, shareRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
