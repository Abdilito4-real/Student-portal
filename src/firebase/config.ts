import { initializeApp, getApps, getApp } from 'firebase/app';

/**
 * Firebase configuration.
 * For prototypes, we use the values directly to ensure the app initializes correctly
 * in all environments. Ensure environment variables are set in production.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAs-placeholder-key",
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-6813230896-c1cd5"}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-6813230896-c1cd5",
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-6813230896-c1cd5"}.firebasestorage.app`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export { app };
export default app;
