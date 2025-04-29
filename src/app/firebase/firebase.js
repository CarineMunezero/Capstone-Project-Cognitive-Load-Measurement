// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Add this line
import { getAuth } from "firebase/auth"; // Add this too if missing
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_QRNB0wVGrX4Ku00eQd25UBeZzF5xssQ",
  authDomain: "lockheed-cognisense.firebaseapp.com",
  projectId: "lockheed-cognisense",
  storageBucket: "lockheed-cognisense.firebasestorage.app",
  messagingSenderId: "341297866576",
  appId: "1:341297866576:web:8cc6b54ea1010bc3dcae55",
  measurementId: "G-PF1DJH6M9Q"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Export them
export { db, auth };