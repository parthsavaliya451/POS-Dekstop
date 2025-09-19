// src/services/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";             // Import Firebase Auth
import { getFirestore } from "firebase/firestore";   // Import Firestore

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAVX7Tv0ouJH13NL_Cn9ln43BSw4cpmgvI",
  authDomain: "store-inventory-fb5fc.firebaseapp.com",
  projectId: "store-inventory-fb5fc",
  storageBucket: "store-inventory-fb5fc.appspot.com",  // Fix typo here: should be .appspot.com
  messagingSenderId: "109624201638",
  appId: "1:109624201638:web:b5931f6d17d7dff551ff67",
  measurementId: "G-6L6XL2XHWP"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
