// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAXqvr21ZS8OpSEID0AW8A1nYfJoUzbWo",
  authDomain: "finalproyect-3d7b4.firebaseapp.com",
  projectId: "finalproyect-3d7b4",
  storageBucket: "finalproyect-3d7b4.firebasestorage.app",
  messagingSenderId: "824877324217",
  appId: "1:824877324217:web:2db2dae0830c9624228868"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

