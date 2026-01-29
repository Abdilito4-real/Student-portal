import { initializeApp, getApps, getApp } from 'firebase/app';

// Using hardcoded config for the prototype environment to ensure stability
export const firebaseConfig = {
  apiKey: "AIzaSyAs-example-key-replace-with-real",
  authDomain: "studio-6813230896-c1cd5.firebaseapp.com",
  projectId: "studio-6813230896-c1cd5",
  storageBucket: "studio-6813230896-c1cd5.firebasestorage.app",
  messagingSenderId: "6813230896",
  appId: "1:6813230896:web:example-id"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export { app };
export default app;
