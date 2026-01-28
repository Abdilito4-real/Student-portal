'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Initializes and returns the Firebase SDK instances.
 * This is designed to be called once, typically at the module level or root of the app.
 */
export function initializeFirebase() {
  // If we already have an app initialized, just return the SDKs for it.
  if (getApps().length) {
    return getSdks(getApp());
  }

  // Fallback check: if config is missing (should not happen with hardcoding), 
  // we attempt to provide a useful error.
  if (!firebaseConfig.apiKey) {
    throw new Error(
      'Firebase configuration is missing. Ensure src/firebase/config.ts contains valid credentials.'
    );
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

// Initialize at module level for client-side consumption.
// Note: In Next.js SSR, this may run on the server, so we handle it idempotently.
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
