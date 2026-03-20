import { getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBFX3PDCLxV3Frd4UaL6Ydtuuk7U0H-tpk",
  authDomain: "talos-agente-personal-agustin.firebaseapp.com",
  projectId: "talos-agente-personal-agustin",
  storageBucket: "talos-agente-personal-agustin.firebasestorage.app",
  messagingSenderId: "213567039014",
  appId: "1:213567039014:web:e6a5162b2fd4fafc4ae8e7",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const clientDb = getFirestore(app);
export const clientAuth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
