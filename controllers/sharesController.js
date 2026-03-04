const { db } = require('../config/firebase');

/**
 * Get all shares where the current user is the owner.
 * Returns both pending and accepted shares so the owner can see invite status.
 * GET /api/shares
 */
exports.getMyShares = async (req, res) => {
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
 * Get all accepted shares where the current user is the recipient.
 * Only returns accepted shares (for displaying shared applications).
 * GET /api/shares/with-me
 */
exports.getSharedWithMe = async (req, res) => {
    try {
        const snapshot = await db.collection('shares')
            .where('sharedWithId', '==', req.user.uid)
            .where('status', '==', 'accepted')
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
 * Get pending invitations for the current user (shares awaiting acceptance).
 * GET /api/shares/invitations
 */
exports.getInvitations = async (req, res) => {
    try {
        const snapshot = await db.collection('shares')
            .where('sharedWithId', '==', req.user.uid)
            .where('status', '==', 'pending')
            .get();

        const invitations = [];
        snapshot.forEach(doc => {
            invitations.push({ _id: doc.id, ...doc.data() });
        });
        return res.status(200).json(invitations);
    } catch (error) {
        console.error('Error getting invitations:', error);
        return res.status(500).json({ error: 'Failed to fetch invitations' });
    }
};

/**
 * Create a new share invitation (status starts as 'pending').
 * POST /api/shares
 * Body: { sharedWithId, sharedWithEmail, sharedWithName, shareAll, applicationIds }
 */
exports.createShare = async (req, res) => {
    try {
        const { sharedWithId, sharedWithEmail, sharedWithName, shareAll, applicationIds } = req.body;

        if (!sharedWithId || !sharedWithEmail) {
            return res.status(400).json({ error: 'sharedWithId and sharedWithEmail are required' });
        }

        if (sharedWithId === req.user.uid) {
            return res.status(400).json({ error: 'Cannot share with yourself' });
        }

        // Check if share already exists (any status)
        const existing = await db.collection('shares')
            .where('ownerId', '==', req.user.uid)
            .where('sharedWithId', '==', sharedWithId)
            .limit(1)
            .get();

        if (!existing.empty) {
            return res.status(409).json({ error: 'An invitation already exists for this user' });
        }

        const now = new Date().toISOString();
        const shareData = {
            ownerId: req.user.uid,
            ownerEmail: req.user.email,
            ownerName: req.user.name,
            sharedWithId,
            sharedWithEmail,
            sharedWithName: sharedWithName || '',
            shareAll: shareAll ?? true,
            applicationIds: applicationIds || [],
            status: 'pending',
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
 * Respond to a share invitation (accept or reject).
 * Only the recipient can respond.
 * PUT /api/shares/:id/respond
 * Body: { action: 'accept' | 'reject' }
 */
exports.respondToShare = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;

        if (!action || !['accept', 'reject'].includes(action)) {
            return res.status(400).json({ error: 'Action must be "accept" or "reject"' });
        }

        const docRef = db.collection('shares').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Invitation not found' });
        }

        const share = doc.data();

        // Only the recipient can respond
        if (share.sharedWithId !== req.user.uid) {
            return res.status(403).json({ error: 'Not authorized to respond to this invitation' });
        }

        if (share.status !== 'pending') {
            return res.status(400).json({ error: 'This invitation has already been responded to' });
        }

        if (action === 'reject') {
            // Delete the share document entirely on rejection
            await docRef.delete();
            return res.status(200).json({ message: 'Invitation declined' });
        }

        // Accept: update status
        await docRef.update({
            status: 'accepted',
            updatedAt: new Date().toISOString(),
        });

        const updated = await docRef.get();
        return res.status(200).json({ _id: updated.id, ...updated.data() });
    } catch (error) {
        console.error('Error responding to share:', error);
        return res.status(500).json({ error: 'Failed to respond to invitation' });
    }
};

/**
 * Update a share configuration (toggle shareAll, update applicationIds).
 * Only the owner can update. Only accepted shares can be updated.
 * PUT /api/shares/:id
 * Body: { shareAll, applicationIds }
 */
exports.updateShare = async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = db.collection('shares').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Share not found' });
        }

        const share = doc.data();

        // Only the owner can update
        if (share.ownerId !== req.user.uid) {
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
 * Delete a share (cancel invitation or remove sharing).
 * Owner can always delete. Recipient can delete accepted shares (stop receiving).
 * DELETE /api/shares/:id
 */
exports.deleteShare = async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = db.collection('shares').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Share not found' });
        }

        const share = doc.data();

        // Owner can always delete; recipient can delete accepted shares
        const isOwner = share.ownerId === req.user.uid;
        const isRecipient = share.sharedWithId === req.user.uid;

        if (!isOwner && !isRecipient) {
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
 * Only works for accepted shares.
 * GET /api/shares/:id/applications
 */
exports.getSharedApplications = async (req, res) => {
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

        // Only accepted shares can be read
        if (share.status !== 'accepted') {
            return res.status(403).json({ error: 'This share has not been accepted yet' });
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
