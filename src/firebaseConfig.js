import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import getFirestore
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBqdRHCaKptrki-xCEyQUnD2i0m1Wt37Ww",
  authDomain: "menu-x-web-app.firebaseapp.com",
  projectId: "menu-x-web-app",
  storageBucket: "menu-x-web-app.firebasestorage.app",
  messagingSenderId: "31809696484",
  appId: "1:31809696484:web:acc7e8fc74f90d86ad32f1",
  measurementId: "G-N9TBRX1MHD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Get the Auth instance
const db = getFirestore(app); // Get the Firestore instance
const analytics = getAnalytics(app);

export { app, auth, db, analytics }; // Export db
