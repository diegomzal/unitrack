const admin = require('firebase-admin');

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (err) {
        console.error('⚠️  Failed to parse FIREBASE_SERVICE_ACCOUNT env var:', err.message);
    }
}

if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized via FIREBASE_SERVICE_ACCOUNT env var');
} else {
    try {
        admin.initializeApp();
        console.log('✅ Firebase Admin initialized via Application Default Credentials');
    } catch (error) {
        console.error('❌ Firebase Admin initialization failed:', error.message);
    }
}

const db = admin.firestore?.();

module.exports = { admin, db };
