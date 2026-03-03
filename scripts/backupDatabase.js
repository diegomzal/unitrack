require('dotenv').config();
const { db } = require('../config/firebase');
const fs = require('fs');
const path = require('path');

async function backupDatabase() {
    if (!db) {
        console.error("Database not initialized. Missing credentials.");
        process.exit(1);
    }

    console.log("Starting database backup...");
    const collectionsToBackup = ['users', 'applications', 'shares', 'universities'];
    const backupData = {};

    try {
        for (const collectionName of collectionsToBackup) {
            console.log(`Backing up collection: ${collectionName}...`);
            const snapshot = await db.collection(collectionName).get();
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            backupData[collectionName] = docs;
            console.log(`  -> Backed up ${docs.length} documents from ${collectionName}`);
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `db-backup-${timestamp}.json`;
        const filepath = path.join(__dirname, '..', filename);

        fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

        console.log(`✅ Backup completed successfully! Saved to: ${filepath}`);

    } catch (error) {
        console.error("❌ Backup failed:", error);
    } finally {
        process.exit(0);
    }
}

backupDatabase();
