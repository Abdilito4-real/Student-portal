'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Initializes and returns the Firebase SDK instances.
 */
export function initializeFirebase() {
  if (getApps().length) {
    const existingApp = getApp();
    return getSdks(existingApp);
  }

  // Validate that we have at least an API key before initializing
  if (!firebaseConfig.apiKey) {
    console.warn('Firebase Warning: NEXT_PUBLIC_FIREBASE_API_KEY is missing. Ensure your environment variables are configured in Vercel.');
  }

  const firebaseApp = initializeApp(firebaseConfig);
  return getSdks(firebaseApp);
}

/**
 * Returns the Auth and Firestore instances for a given FirebaseApp.
 */
export function getSdks(firebaseApp: FirebaseApp) {
  // Gracefully handle potentially uninitialized auth/firestore if config is invalid
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  return {
    firebaseApp,
    auth,
    firestore,
  };
}

const { firebaseApp, auth, firestore } = initializeFirebase();

export { firebaseApp, auth, firestore };
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
