import * as admin from 'firebase-admin';

// This function ensures the admin app is initialized, but only once.
const initializeAdminApp = () => {
  // If already initialized, do nothing.
  if (admin.apps.length > 0) {
    return;
  }

  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  // If the service account JSON isn't a valid JSON object string, do not initialize.
  if (!serviceAccountString || !serviceAccountString.trim().startsWith('{')) {
    // This is an expected state during local dev before .env is set up, or during a build on a new Vercel project.
    // A console.warn is more appropriate than an error.
    console.warn('Firebase Admin SDK not initialized: FIREBASE_SERVICE_ACCOUNT_JSON is not set or is invalid. Server-rendered pages will use default content.');
    return;
  }
  
  try {
    const serviceAccount = JSON.parse(serviceAccountString);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    // This is a genuine error if the JSON is present but malformed.
    console.error('CRITICAL: Failed to initialize Firebase Admin SDK. The FIREBASE_SERVICE_ACCOUNT_JSON environment variable is likely malformed.');
    console.error('Parsing error:', error.message);
  }
};

// Attempt to initialize on module load.
initializeAdminApp();

/**
 * Gets the initialized Firestore instance.
 * @returns {admin.firestore.Firestore | null} The Firestore instance or null if initialization failed.
 */
export const getAdminDb = (): admin.firestore.Firestore | null => {
  if (admin.apps.length === 0) {
    return null;
  }
  return admin.firestore();
};

/**
 * Gets the initialized Auth instance.
 * @returns {admin.auth.Auth | null} The Auth instance or null if initialization failed.
 */
export const getAdminAuth = (): admin.auth.Auth | null => {
  if (admin.apps.length === 0) {
    return null;
  }
  return admin.auth();
};

// For compatibility with other parts that might use `admin` for types.
export { admin };
