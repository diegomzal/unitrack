require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { authenticate } = require('./middleware/auth');
const { checkDb } = require('./middleware/checkDb');

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const applicationRoutes = require('./routes/applications');
const universityRoutes = require('./routes/universities');
const userRoutes = require('./routes/users');
const shareRoutes = require('./routes/shares');

// Middlewares
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173'];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
}));
app.use(express.json());

// Public route for health check
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to UniTrack API' });
});

// All API routes require authentication and database connection
app.use('/api', checkDb);
app.use('/api/applications', authenticate, applicationRoutes);
app.use('/api/universities', authenticate, universityRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/shares', authenticate, shareRoutes);

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
