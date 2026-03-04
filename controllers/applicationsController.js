const { db } = require('../config/firebase');

exports.getAll = async (req, res) => {
    try {
        const snapshot = await db.collection('applications')
            .where('userId', '==', req.user.uid)
            .get();

        const applications = [];
        snapshot.forEach(doc => {
            applications.push({ _id: doc.id, ...doc.data() });
        });
        res.status(200).json(applications);
    } catch (error) {
        console.error("Error getting applications:", error);
        res.status(500).json({ error: "Failed to fetch applications" });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.collection('applications').doc(id).get();
        if (!result.exists) {
            return res.status(404).json({ error: "Application not found" });
        }

        const data = result.data();
        // Only the owner can access their own application via this endpoint
        if (data.userId !== req.user.uid) {
            return res.status(403).json({ error: "Not authorized to access this application" });
        }

        res.status(200).json({ _id: result.id, ...data });
    } catch (error) {
        console.error("Error getting application by id:", error);
        res.status(500).json({ error: "Failed to fetch application" });
    }
};

exports.create = async (req, res) => {
    try {
        const data = req.body;
        const now = new Date().toISOString();
        const newApplication = {
            userId: req.user.uid,
            title: data.title || '',
            description: data.description || '',
            universityId: data.universityId || null,
            university: data.university || '',
            country: data.country || '',
            duration: data.duration || null,
            links: data.links || [],
            events: data.events || [],
            requirements: data.requirements || [],
            requirementColumns: data.requirementColumns || [
                { id: 'todo', title: 'To Do' },
                { id: 'done', title: 'Done' },
            ],
            costs: data.costs || { tuitionFeePerYear: null, livingCostPerYear: null, scholarshipInfo: '' },
            notes: data.notes || '',
            status: data.status || 'Not started',
            createdAt: now,
            updatedAt: now,
        };

        const docRef = await db.collection('applications').add(newApplication);
        res.status(201).json({ _id: docRef.id, ...newApplication });
    } catch (error) {
        console.error("Error creating application:", error);
        res.status(500).json({ error: "Failed to create application" });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = db.collection('applications').doc(id);
        const existing = await docRef.get();

        if (!existing.exists) {
            return res.status(404).json({ error: "Application not found" });
        }

        // Only the owner can update
        if (existing.data().userId !== req.user.uid) {
            return res.status(403).json({ error: "Not authorized to update this application" });
        }

        const data = req.body;
        const now = new Date().toISOString();

        // Whitelist allowed fields to prevent injection of malicious/extra fields (like createdAt override)
        const allowedFields = [
            'title', 'description', 'universityId', 'university', 'country',
            'duration', 'links', 'events', 'requirements', 'requirementColumns',
            'costs', 'notes', 'status'
        ];

        const updates = {};
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updates[field] = data[field];
            }
        }

        const updatedData = {
            ...updates,
            updatedAt: now,
        };

        await docRef.update(updatedData);

        const result = await docRef.get();
        res.status(200).json({ _id: result.id, ...result.data() });
    } catch (error) {
        console.error("Error updating application:", error);
        res.status(500).json({ error: "Failed to update application" });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = db.collection('applications').doc(id);
        const existing = await docRef.get();

        if (!existing.exists) {
            return res.status(404).json({ error: "Application not found" });
        }

        // Only the owner can delete
        if (existing.data().userId !== req.user.uid) {
            return res.status(403).json({ error: "Not authorized to delete this application" });
        }

        await docRef.delete();
        res.status(200).json({ message: "Application deleted successfully" });
    } catch (error) {
        console.error("Error deleting application:", error);
        res.status(500).json({ error: "Failed to delete application" });
    }
};
