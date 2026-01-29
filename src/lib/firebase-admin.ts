import * as admin from 'firebase-admin';

/**
 * Initializes the Firebase Admin SDK.
 * It expects a single environment variable `FIREBASE_SERVICE_ACCOUNT_JSON`
 * containing the full JSON string of the service account key.
 */
const initializeAdminApp = () => {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountVar) {
    console.error('Firebase Admin SDK Error: FIREBASE_SERVICE_ACCOUNT_JSON environment variable not found. Operations requiring Admin SDK will fail.');
    return null;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountVar);
    
    // Ensure the private key is formatted correctly for environment variables
    // Vercel and other platforms sometimes escape newlines differently
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    console.log('Firebase Admin SDK initialized successfully.');
    return app;
  } catch (error: any) {
    console.error('Failed to parse or initialize Firebase Admin SDK:', error.message);
    return null;
  }
};

const adminApp = initializeAdminApp();

/**
 * Returns the Auth instance for the Admin SDK.
 */
export function getAdminAuth() {
  if (!adminApp) {
    console.error('Admin Auth requested but Admin SDK not initialized.');
    return null;
  }
  return adminApp.auth();
}

/**
 * Returns the Firestore instance for the Admin SDK.
 */
export function getAdminDb() {
  if (!adminApp) {
    console.error('Admin Firestore requested but Admin SDK not initialized.');
    return null;
  }
  return adminApp.firestore();
}

export { adminApp as admin };
