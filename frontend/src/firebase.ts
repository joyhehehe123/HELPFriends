// Import the functions needed from the SDKs needed
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBERCJcKHy3Xu9adx0QaqHzXyhDdVfeqw",
  authDomain: "helpfriends.firebaseapp.com",
  projectId: "helpfriends",
  storageBucket: "helpfriends.firebasestorage.app",
  messagingSenderId: "264120984043",
  appId: "1:264120984043:web:07426bf4d198c78c13f9ae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
