const { db } = require('../config/firebase');

/**
 * Middleware that verifies the Firestore database is initialized.
 * Returns 500 if not. Use as Express middleware or call directly.
 */
const checkDb = (req, res, next) => {
    if (!db) {
        return res.status(500).json({ error: 'Database not initialized. Missing credentials.' });
    }
    next();
};

module.exports = { checkDb, db };
