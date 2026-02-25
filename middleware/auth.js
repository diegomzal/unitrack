const { admin } = require('../config/firebase');

/**
 * Middleware that verifies Firebase ID tokens from the Authorization header.
 * Attaches `req.user` with { uid, email, name, picture } on success.
 */
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email || '',
            name: decodedToken.name || '',
            picture: decodedToken.picture || '',
        };
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = { authenticate };
