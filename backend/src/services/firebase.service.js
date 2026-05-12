import dotenv from 'dotenv';

dotenv.config();

let admin;
let firebaseApp;

const initializeFirebase = async () => {
    try {
        // Dynamic import to prevent crash if not installed
        const firebaseAdmin = await import('firebase-admin');
        admin = firebaseAdmin.default;

        const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

        let credential;

        if (serviceAccountVar) {
            // Option 1: Full JSON as Environment Variable
            credential = admin.credential.cert(JSON.parse(serviceAccountVar));
        } else if (serviceAccountPath) {
            // Option 2: Service Account File Path
            credential = admin.credential.cert(serviceAccountPath);
        }

        if (credential) {
            firebaseApp = admin.initializeApp({
                credential
            });
            console.log('✅ Firebase Admin initialized successfully');
        } else {
            console.warn('⚠️ Firebase Admin not initialized: Missing FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH');
        }
    } catch (error) {
        if (error.code === 'ERR_MODULE_NOT_FOUND' || error.message?.includes('Cannot find package')) {
            console.warn('⚠️ firebase-admin package not found. Push notifications will be disabled. Run "npm install firebase-admin" to enable.');
        } else {
            console.error('❌ Error initializing Firebase Admin:', error);
        }
    }
};

// Start initialization
initializeFirebase();

/**
 * Send push notification to multiple tokens
 * @param {string[]} tokens - Array of FCM tokens
 * @param {Object} payload - Notification payload { title, body, data }
 */
export const sendPushNotification = async (tokens, payload) => {
    if (!firebaseApp || !admin) {
        console.error('❌ Firebase Admin not initialized or package missing');
        return;
    }

    if (!tokens || tokens.length === 0) {
        return;
    }

    try {
        const message = {
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data || {},
            tokens: tokens, 
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Successfully sent: ${response.successCount} messages`);
        console.log(`Failed: ${response.failureCount} messages`);
        
        return response;
    } catch (error) {
        console.error('Error sending push notification:', error);
        throw error;
    }
};

export default firebaseApp;
