import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA3UFEeEe1w01pAR35937e81xmd2Eux9WA",
  authDomain: "moon-b6bbd.firebaseapp.com",
  projectId: "moon-b6bbd",
  storageBucket: "moon-b6bbd.firebasestorage.app",
  messagingSenderId: "538377690183",
  appId: "1:538377690183:web:e16bd78fc46746317f2562",
  measurementId: "G-FVPLKH68D9"
};

// Ініціалізуємо Firebase
const app = initializeApp(firebaseConfig);

// Експортуємо інструменти для використання в App.jsx
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();