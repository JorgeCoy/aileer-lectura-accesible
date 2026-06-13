import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Credenciales proporcionadas para el proyecto aleer-3dfdd
const firebaseConfig = {
  apiKey: "AIzaSyCs0PHG0ceFxnI8Tt3L3OEQ3jt7HUA91H4",
  authDomain: "aleer-3dfdd.firebaseapp.com",
  projectId: "aleer-3dfdd",
  storageBucket: "aleer-3dfdd.firebasestorage.app",
  messagingSenderId: "624976352926",
  appId: "1:624976352926:web:1b9b29136e6b61d53f8d8f",
  measurementId: "G-C7TSX2XD3R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
