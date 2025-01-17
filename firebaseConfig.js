// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA98CxxaK2ax9iMU5FqyzXfBRvp6PgoFLY",
  authDomain: "pmchecklist-f5496.firebaseapp.com",
  projectId: "pmchecklist-f5496",
  storageBucket: "pmchecklist-f5496.firebasestorage.app",
  messagingSenderId: "502467959039",
  appId: "1:502467959039:web:65a0a30af44d900e89d4ca",
  measurementId: "G-PDB569PNBX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

console.log("Hello Firebase");
