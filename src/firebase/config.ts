import { initializeApp, getApps, getApp } from 'firebase/app';

/**
 * Firebase client-side configuration.
 * All values are fetched strictly from environment variables starting with NEXT_PUBLIC_.
 * These are safe to expose to the browser as security is handled via Security Rules.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if all configuration values are present
const isConfigValid = Object.values(firebaseConfig).every(val => !!val);

if (!isConfigValid && typeof window !== 'undefined') {
  console.warn(
    'Firebase Warning: One or more NEXT_PUBLIC_FIREBASE_ variables are missing. ' +
    'Check your .env.local file or Vercel project settings.'
  );
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export { app };
export default app;
