const { db } = require('../config/firebase');

/**
 * Ensures a user profile exists in Firestore.
 * Called on every authenticated request (idempotent).
 * POST /api/users/me
 */
exports.ensureProfile = async (req, res) => {
    if (!db) {
        return res.status(500).json({ error: 'Database not initialized' });
    }

    try {
        const { uid, email, name, picture } = req.user;
        const userRef = db.collection('users').doc(uid);
        const doc = await userRef.get();

        if (!doc.exists) {
            const profile = {
                uid,
                email,
                displayName: name,
                photoURL: picture,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            await userRef.set(profile);
            return res.status(201).json(profile);
        }

        // Update last-seen fields if changed
        const updates = {};
        const data = doc.data();
        if (data.email !== email) updates.email = email;
        if (data.displayName !== name) updates.displayName = name;
        if (data.photoURL !== picture) updates.photoURL = picture;

        if (Object.keys(updates).length > 0) {
            updates.updatedAt = new Date().toISOString();
            await userRef.update(updates);
        }

        return res.status(200).json({ ...data, ...updates });
    } catch (error) {
        console.error('Error ensuring user profile:', error);
        return res.status(500).json({ error: 'Failed to ensure user profile' });
    }
};

/**
 * Search users by email prefix (for sharing autocomplete).
 * GET /api/users/search?email=query
 */
exports.searchByEmail = async (req, res) => {
    if (!db) {
        return res.status(500).json({ error: 'Database not initialized' });
    }

    try {
        const { email } = req.query;
        if (!email || email.length < 3) {
            return res.status(400).json({ error: 'Email query must be at least 3 characters' });
        }

        // Range query: email >= query AND email < query + high Unicode char
        const snapshot = await db.collection('users')
            .where('email', '>=', email.toLowerCase())
            .where('email', '<', email.toLowerCase() + '\uf8ff')
            .limit(10)
            .get();

        const users = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Don't return yourself
            if (data.uid !== req.user.uid) {
                users.push({
                    uid: data.uid,
                    email: data.email,
                    displayName: data.displayName,
                    photoURL: data.photoURL,
                });
            }
        });

        return res.status(200).json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        return res.status(500).json({ error: 'Failed to search users' });
    }
};
