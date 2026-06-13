import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Credenciales reales del proyecto aLeer
const firebaseConfig = {
    apiKey: "AIzaSyCs0PHG0ceFxnI8Tt3L3OEQ3jt7HUA91H4",
    authDomain: "aleer-3dfdd.firebaseapp.com",
    projectId: "aleer-3dfdd",
    storageBucket: "aleer-3dfdd.firebasestorage.app",
    messagingSenderId: "624976352926",
    appId: "1:624976352926:web:1b9b29136e6b61d53f8d8f",
    measurementId: "G-C7TSX2XD3R"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
