require('dotenv').config();
const { db } = require('../config/firebase');

async function migrateUniversities() {
    if (!db) {
        console.error("Database not initialized. Missing credentials.");
        process.exit(1);
    }

    console.log("Starting migration: Grouping applications by university...");

    try {
        // Get all applications
        const appsSnapshot = await db.collection('applications').get();
        const applications = appsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log(`Found ${applications.length} total applications.`);

        let updatedCount = 0;
        let createdUniCount = 0;

        // Group by user
        const usersMap = {}; // userId -> { applications: [], universities: [] }

        for (const app of applications) {
            if (!usersMap[app.userId]) {
                usersMap[app.userId] = { applications: [], universities: [] };
                // Fetch user's universities
                const unisSnapshot = await db.collection('universities')
                    .where('userId', '==', app.userId)
                    .get();
                usersMap[app.userId].universities = unisSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
            usersMap[app.userId].applications.push(app);
        }

        const batch = db.batch();
        let batchCount = 0;

        // Process each user's applications
        for (const userId of Object.keys(usersMap)) {
            const userData = usersMap[userId];
            const { applications: userApps, universities: userUnis } = userData;

            for (const app of userApps) {
                // If it already has a valid linked universityId, skip
                if (app.universityId) continue;

                // If no university name string, skip (can't group it)
                if (!app.university || typeof app.university !== 'string' || !app.university.trim()) continue;

                const uniName = app.university.trim();

                // Find existing university doc for this user by exact name (case-insensitive)
                let uniDoc = userUnis.find(u => u.name.toLowerCase() === uniName.toLowerCase());

                // If not found, create a new university doc reference
                if (!uniDoc) {
                    const uniRef = db.collection('universities').doc();
                    const now = new Date().toISOString();
                    const newUni = {
                        userId: app.userId,
                        name: uniName,
                        country: app.country || '',
                        events: [],
                        requirements: [],
                        requirementColumns: [
                            { id: 'todo', title: 'To Do' },
                            { id: 'done', title: 'Done' },
                        ],
                        costs: { tuitionFeePerYear: null, livingCostPerYear: null, scholarshipInfo: '' },
                        notes: '',
                        createdAt: now,
                        updatedAt: now,
                    };

                    // Add to batch
                    batch.set(uniRef, newUni);
                    batchCount++;
                    createdUniCount++;

                    // Add to local cache so subsequent loops find it
                    uniDoc = { id: uniRef.id, ...newUni };
                    userUnis.push(uniDoc);
                    console.log(`Created new university group: "${uniName}" for user: ${userId}`);
                }

                // Update application with universityId
                const appRef = db.collection('applications').doc(app.id);
                batch.update(appRef, { universityId: uniDoc.id });
                batchCount++;
                updatedCount++;
                console.log(`Linked application "${app.title}" to university "${uniName}" (ID: ${uniDoc.id})`);

                // Commit batch if getting large limitations (500 ops max per batch)
                if (batchCount >= 400) {
                    console.log("Committing batch write...");
                    await batch.commit();
                    batchCount = 0;
                }
            }
        }

        if (batchCount > 0) {
            console.log("Committing final batch write...");
            await batch.commit();
        }

        console.log("✅ Migration completed successfully!");
        console.log(`   - New Universities created: ${createdUniCount}`);
        console.log(`   - Applications updated: ${updatedCount}`);

    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        process.exit(0);
    }
}

migrateUniversities();
