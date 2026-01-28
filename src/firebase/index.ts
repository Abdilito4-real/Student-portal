'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Initializes Firebase for the client-side.
 * Gracefully handles missing config during build time.
 */
export function initializeFirebase() {
  // If we don't have an API key (e.g., during build), return dummy SDKs
  // This prevents the 'app/no-options' error from crashing the build.
  if (!firebaseConfig.apiKey) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('Firebase client config is missing API key during build.');
    }
    return {
      firebaseApp: null as any,
      auth: null as any,
      firestore: null as any,
    };
  }
  
  if (getApps().length) {
    return getSdks(getApp());
  }

  const firebaseApp = initializeApp(firebaseConfig);
  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
