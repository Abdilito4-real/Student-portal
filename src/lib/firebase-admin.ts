
import * as admin from 'firebase-admin';

// This function ensures the admin app is initialized, but only once.
const initializeAdminApp = () => {
  // If already initialized, do nothing.
  if (admin.apps.length > 0) {
    return;
  }

  // In a production environment (like Vercel)
  if (process.env.NODE_ENV === 'production') {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (!serviceAccountString) {
      console.error('CRITICAL: FIREBASE_SERVICE_ACCOUNT_JSON env var is not set on Vercel. Admin SDK cannot initialize.');
      return;
    }

    try {
      // Vercel can sometimes escape the JSON string.
      // We first try to parse it directly.
      const serviceAccount = JSON.parse(serviceAccountString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully for Vercel production.');
    } catch (error: any) {
         try {
            // As a fallback, try to decode from Base64. This is a common workaround.
            const decodedString = Buffer.from(serviceAccountString, 'base64').toString('utf-8');
            const serviceAccount = JSON.parse(decodedString);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('Firebase Admin SDK initialized successfully from Base64 encoded key.');
        } catch (finalError: any) {
            console.error('CRITICAL: Failed to initialize Firebase Admin SDK. The FIREBASE_SERVICE_ACCOUNT_JSON environment variable is likely malformed or not set correctly in your Vercel project settings.');
            console.error('Primary parsing error:', error.message);
            console.error('Fallback parsing error:', finalError.message);
        }
    }
  } else {
    // In a local development environment
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (!serviceAccountString) {
        console.warn('FIREBASE_SERVICE_ACCOUNT_JSON not found in .env file. Admin SDK not initialized for local dev.');
        return;
    }
    
    try {
        const serviceAccount = JSON.parse(serviceAccountString);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin SDK initialized successfully for local development from .env file.');
    } catch (e: any) {
        console.error('Error initializing Firebase Admin SDK for local development:', e.message);
    }
  }
};

export const getAdminDb = () => {
  initializeAdminApp();
  if (admin.apps.length === 0) {
    throw new Error('The default Firebase admin app does not exist. Initialization likely failed. Check server logs for details.');
  }
  return admin.firestore();
};

export const getAdminAuth = () => {
  initializeAdminApp();
  if (admin.apps.length === 0) {
    throw new Error('The default Firebase admin app does not exist. Initialization likely failed. Check server logs for details.');
  }
  return admin.auth();
};

// For compatibility with other parts that might use `admin` for types.
export { admin };
