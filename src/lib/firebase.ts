import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAYz46ekCx3CHmFi_w2ORWDLP-1hrM8gn8",
  authDomain: "drive-clone-project-42a0a.firebaseapp.com",
  projectId: "drive-clone-project-42a0a",
  storageBucket: "drive-clone-project-42a0a.firebasestorage.app",
  messagingSenderId: "521801667591",
  appId: "1:521801667591:web:8a750780dce575c2e686a2"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };
