const { db } = require('../config/firebase');

// Utility to verify Database initialization
const checkDb = (res) => {
    if (!db) {
        return res.status(500).json({ error: "Database not initialized. Missing credentials." });
    }
    return true;
};

exports.getAll = async (req, res) => {
    if (!checkDb(res)) return;
    try {
        const snapshot = await db.collection('applications').get();
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
    if (!checkDb(res)) return;
    try {
        const { id } = req.params;
        const result = await db.collection('applications').doc(id).get();
        if (!result.exists) {
            return res.status(404).json({ error: "Application not found" });
        }
        res.status(200).json({ _id: result.id, ...result.data() });
    } catch (error) {
        console.error("Error getting application by id:", error);
        res.status(500).json({ error: "Failed to fetch application" });
    }
};

exports.create = async (req, res) => {
    if (!checkDb(res)) return;
    try {
        const data = req.body;
        // ensure default fields 
        const now = new Date().toISOString();
        const newApplication = {
            userId: data.userId || 'local-user', // hardcoded for now until auth is built
            title: data.title || '',
            description: data.description || '',
            university: data.university || '',
            country: data.country || '',
            duration: data.duration || null,
            links: data.links || [],
            events: data.events || [],
            requirements: data.requirements || [],
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
    if (!checkDb(res)) return;
    try {
        const { id } = req.params;
        const updates = req.body;
        const now = new Date().toISOString();

        // Remove immutable fields if passing a full object
        delete updates._id;

        const updatedData = {
            ...updates,
            updatedAt: now,
        };

        await db.collection('applications').doc(id).update(updatedData);

        // Fetch updated doc to return
        const result = await db.collection('applications').doc(id).get();
        res.status(200).json({ _id: result.id, ...result.data() });
    } catch (error) {
        console.error("Error updating application:", error);
        res.status(500).json({ error: "Failed to update application" });
    }
};

exports.delete = async (req, res) => {
    if (!checkDb(res)) return;
    try {
        const { id } = req.params;
        await db.collection('applications').doc(id).delete();
        res.status(200).json({ message: "Application deleted successfully" });
    } catch (error) {
        console.error("Error deleting application:", error);
        res.status(500).json({ error: "Failed to delete application" });
    }
};
