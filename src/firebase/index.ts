'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Initializes and returns the Firebase SDK instances.
 * Returns null for services if configuration is missing to prevent runtime crashes.
 */
export function initializeFirebase() {
  if (getApps().length > 0) {
    const existingApp = getApp();
    return getSdks(existingApp);
  }

  // Check if the configuration is valid before initializing
  // We check for both existence and the literal string "undefined" which can happen in some build environments
  const isConfigValid = !!firebaseConfig.apiKey && 
                        firebaseConfig.apiKey !== 'undefined' && 
                        firebaseConfig.apiKey !== '';

  if (!isConfigValid) {
    if (typeof window !== 'undefined') {
      console.warn(
        'Firebase Configuration Missing: The app is running without client-side Firebase credentials. ' +
        'Please ensure NEXT_PUBLIC_FIREBASE_API_KEY and other variables are set in Vercel.'
      );
    }
    return {
      firebaseApp: null,
      auth: null,
      firestore: null,
    };
  }

  try {
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    return {
      firebaseApp: null,
      auth: null,
      firestore: null,
    };
  }
}

/**
 * Returns the Auth and Firestore instances for a given FirebaseApp.
 */
export function getSdks(firebaseApp: FirebaseApp) {
  let auth: Auth | null = null;
  let firestore: Firestore | null = null;

  try {
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  } catch (error) {
    console.error('Error getting Firebase services:', error);
  }

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
