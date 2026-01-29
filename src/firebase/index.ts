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
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "undefined") {
    console.error('Firebase configuration is invalid or missing.');
    // Return dummy instances or handle as appropriate for your error boundary
  }

  const firebaseApp = initializeApp(firebaseConfig);
  return getSdks(firebaseApp);
}

/**
 * Returns the Auth and Firestore instances for a given FirebaseApp.
 */
export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
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
