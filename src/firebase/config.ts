import { initializeApp, getApps, getApp } from 'firebase/app';

/**
 * Hardcoded Firebase configuration for the Campus Hub project.
 * This ensures the app is correctly configured regardless of environment variables.
 */
const firebaseConfig = {
  apiKey: "AIzaSyC1XGJCUVNFtLaKIbbfk6-H0mgolLhXI5s",
  authDomain: "studio-6813230896-c1cd5.firebaseapp.com",
  projectId: "studio-6813230896-c1cd5",
  storageBucket: "studio-6813230896-c1cd5.firebasestorage.app",
  messagingSenderId: "13689966446",
  appId: "1:13689966446:web:7f56209d2da33e75187b7f"
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export { app, firebaseConfig };
export default app;
