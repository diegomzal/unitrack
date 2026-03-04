const { db } = require('../config/firebase');

exports.getAll = async (req, res) => {
    try {
        const snapshot = await db.collection('universities')
            .where('userId', '==', req.user.uid)
            .get();

        const universities = [];
        snapshot.forEach(doc => {
            universities.push({ _id: doc.id, ...doc.data() });
        });
        res.status(200).json(universities);
    } catch (error) {
        console.error("Error getting universities:", error);
        res.status(500).json({ error: "Failed to fetch universities" });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.collection('universities').doc(id).get();
        if (!result.exists) {
            return res.status(404).json({ error: "University not found" });
        }

        const data = result.data();
        if (data.userId !== req.user.uid) {
            return res.status(403).json({ error: "Not authorized to access this university" });
        }

        res.status(200).json({ _id: result.id, ...data });
    } catch (error) {
        console.error("Error getting university by id:", error);
        res.status(500).json({ error: "Failed to fetch university" });
    }
};

exports.create = async (req, res) => {
    try {
        const data = req.body;
        const now = new Date().toISOString();
        const newUniversity = {
            userId: req.user.uid,
            name: data.name || '',
            country: data.country || '',
            events: data.events || [],
            requirements: data.requirements || [],
            requirementColumns: data.requirementColumns || [
                { id: 'todo', title: 'To Do' },
                { id: 'done', title: 'Done' },
            ],
            costs: data.costs || { tuitionFeePerYear: null, livingCostPerYear: null, scholarshipInfo: '' },
            notes: data.notes || '',
            createdAt: now,
            updatedAt: now,
        };

        const docRef = await db.collection('universities').add(newUniversity);
        res.status(201).json({ _id: docRef.id, ...newUniversity });
    } catch (error) {
        console.error("Error creating university:", error);
        res.status(500).json({ error: "Failed to create university" });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = db.collection('universities').doc(id);
        const existing = await docRef.get();

        if (!existing.exists) {
            return res.status(404).json({ error: "University not found" });
        }

        if (existing.data().userId !== req.user.uid) {
            return res.status(403).json({ error: "Not authorized to update this university" });
        }

        const data = req.body;
        const now = new Date().toISOString();

        // Whitelist allowed fields to prevent injection
        const allowedFields = [
            'name', 'country', 'events', 'requirements',
            'requirementColumns', 'costs', 'notes'
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

        // Cascade name/country changes to linked applications
        const oldData = existing.data();
        const nameChanged = updates.name && updates.name !== oldData.name;
        const countryChanged = updates.country !== undefined && updates.country !== oldData.country;

        if (nameChanged || countryChanged) {
            const appsSnapshot = await db.collection('applications')
                .where('userId', '==', req.user.uid)
                .where('universityId', '==', id)
                .get();

            if (!appsSnapshot.empty) {
                const batch = db.batch();
                const appUpdates = {};
                if (nameChanged) appUpdates.university = updates.name;
                if (countryChanged) appUpdates.country = updates.country;
                appUpdates.updatedAt = now;

                appsSnapshot.forEach(doc => {
                    batch.update(doc.ref, appUpdates);
                });
                await batch.commit();
            }
        }

        const result = await docRef.get();
        res.status(200).json({ _id: result.id, ...result.data() });
    } catch (error) {
        console.error("Error updating university:", error);
        res.status(500).json({ error: "Failed to update university" });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = db.collection('universities').doc(id);
        const existing = await docRef.get();

        if (!existing.exists) {
            return res.status(404).json({ error: "University not found" });
        }

        if (existing.data().userId !== req.user.uid) {
            return res.status(403).json({ error: "Not authorized to delete this university" });
        }

        // Also unlink any applications that reference this university
        const appsSnapshot = await db.collection('applications')
            .where('userId', '==', req.user.uid)
            .where('universityId', '==', id)
            .get();

        const batch = db.batch();
        appsSnapshot.forEach(doc => {
            batch.update(doc.ref, { universityId: null });
        });
        batch.delete(docRef);
        await batch.commit();

        res.status(200).json({ message: "University deleted successfully" });
    } catch (error) {
        console.error("Error deleting university:", error);
        res.status(500).json({ error: "Failed to delete university" });
    }
};
