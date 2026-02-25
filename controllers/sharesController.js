const { db } = require('../config/firebase');

const checkDb = (res) => {
    if (!db) {
        return res.status(500).json({ error: 'Database not initialized' });
    }
    return true;
};

/**
 * Get all shares where the current user is the owner.
 * GET /api/shares
 */
exports.getMyShares = async (req, res) => {
    if (!checkDb(res)) return;
    try {
        const snapshot = await db.collection('shares')
            .where('ownerId', '==', req.user.uid)
            .get();

        const shares = [];
        snapshot.forEach(doc => {
            shares.push({ _id: doc.id, ...doc.data() });
        });
        return res.status(200).json(shares);
    } catch (error) {
        console.error('Error getting shares:', error);
        return res.status(500).json({ error: 'Failed to fetch shares' });
    }
};

/**
 * Get all shares where the current user is the recipient (shared with me).
 * GET /api/shares/with-me
 */
exports.getSharedWithMe = async (req, res) => {
    if (!checkDb(res)) return;
    try {
        const snapshot = await db.collection('shares')
            .where('sharedWithId', '==', req.user.uid)
            .get();

        const shares = [];
        snapshot.forEach(doc => {
            shares.push({ _id: doc.id, ...doc.data() });
        });
        return res.status(200).json(shares);
    } catch (error) {
        console.error('Error getting shared-with-me:', error);
        return res.status(500).json({ error: 'Failed to fetch shared items' });
    }
};

/**
 * Create a new share (add a friend to share with).
 * POST /api/shares
 * Body: { sharedWithId, sharedWithEmail, sharedWithName, shareAll, applicationIds }
 */
exports.createShare = async (req, res) => {
    if (!checkDb(res)) return;
    try {
        const { sharedWithId, sharedWithEmail, sharedWithName, shareAll, applicationIds } = req.body;

        if (!sharedWithId || !sharedWithEmail) {
            return res.status(400).json({ error: 'sharedWithId and sharedWithEmail are required' });
        }

        if (sharedWithId === req.user.uid) {
            return res.status(400).json({ error: 'Cannot share with yourself' });
        }

        // Check if share already exists
        const existing = await db.collection('shares')
            .where('ownerId', '==', req.user.uid)
            .where('sharedWithId', '==', sharedWithId)
            .limit(1)
            .get();

        if (!existing.empty) {
            return res.status(409).json({ error: 'Share already exists with this user' });
        }

        const now = new Date().toISOString();
        const shareData = {
            ownerId: req.user.uid,
            ownerEmail: req.user.email,
            ownerName: req.user.name,
            sharedWithId,
            sharedWithEmail,
            sharedWithName: sharedWithName || '',
            shareAll: shareAll ?? true, // default: share all applications
            applicationIds: applicationIds || [], // specific app IDs when shareAll is false
            createdAt: now,
            updatedAt: now,
        };

        const docRef = await db.collection('shares').add(shareData);
        return res.status(201).json({ _id: docRef.id, ...shareData });
    } catch (error) {
        console.error('Error creating share:', error);
        return res.status(500).json({ error: 'Failed to create share' });
    }
};

/**
 * Update a share configuration (toggle shareAll, update applicationIds).
 * PUT /api/shares/:id
 * Body: { shareAll, applicationIds }
 */
exports.updateShare = async (req, res) => {
    if (!checkDb(res)) return;
    try {
        const { id } = req.params;
        const docRef = db.collection('shares').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Share not found' });
        }

        // Only the owner can update
        if (doc.data().ownerId !== req.user.uid) {
            return res.status(403).json({ error: 'Not authorized to update this share' });
        }

        const { shareAll, applicationIds } = req.body;
        const updates = { updatedAt: new Date().toISOString() };

        if (shareAll !== undefined) updates.shareAll = shareAll;
        if (applicationIds !== undefined) updates.applicationIds = applicationIds;

        await docRef.update(updates);

        const updated = await docRef.get();
        return res.status(200).json({ _id: updated.id, ...updated.data() });
    } catch (error) {
        console.error('Error updating share:', error);
        return res.status(500).json({ error: 'Failed to update share' });
    }
};

/**
 * Delete a share (remove a friend).
 * DELETE /api/shares/:id
 */
exports.deleteShare = async (req, res) => {
    if (!checkDb(res)) return;
    try {
        const { id } = req.params;
        const docRef = db.collection('shares').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Share not found' });
        }

        // Only the owner can delete
        if (doc.data().ownerId !== req.user.uid) {
            return res.status(403).json({ error: 'Not authorized to delete this share' });
        }

        await docRef.delete();
        return res.status(200).json({ message: 'Share removed successfully' });
    } catch (error) {
        console.error('Error deleting share:', error);
        return res.status(500).json({ error: 'Failed to delete share' });
    }
};

/**
 * Get shared applications (read-only) from a specific owner.
 * GET /api/shares/:id/applications
 */
exports.getSharedApplications = async (req, res) => {
    if (!checkDb(res)) return;
    try {
        const { id } = req.params;
        const shareDoc = await db.collection('shares').doc(id).get();

        if (!shareDoc.exists) {
            return res.status(404).json({ error: 'Share not found' });
        }

        const share = shareDoc.data();

        // Only the recipient can view shared applications
        if (share.sharedWithId !== req.user.uid) {
            return res.status(403).json({ error: 'Not authorized to view these applications' });
        }

        let applications = [];

        if (share.shareAll) {
            // Fetch all applications from the owner
            const snapshot = await db.collection('applications')
                .where('userId', '==', share.ownerId)
                .get();

            snapshot.forEach(doc => {
                applications.push({ _id: doc.id, ...doc.data() });
            });
        } else if (share.applicationIds && share.applicationIds.length > 0) {
            // Fetch only specific applications
            // Firestore 'in' queries support max 30 items
            const chunks = [];
            for (let i = 0; i < share.applicationIds.length; i += 30) {
                chunks.push(share.applicationIds.slice(i, i + 30));
            }

            for (const chunk of chunks) {
                const snapshot = await db.collection('applications')
                    .where('__name__', 'in', chunk)
                    .get();

                snapshot.forEach(doc => {
                    // Verify ownership
                    const data = doc.data();
                    if (data.userId === share.ownerId) {
                        applications.push({ _id: doc.id, ...data });
                    }
                });
            }
        }

        return res.status(200).json(applications);
    } catch (error) {
        console.error('Error getting shared applications:', error);
        return res.status(500).json({ error: 'Failed to fetch shared applications' });
    }
};
