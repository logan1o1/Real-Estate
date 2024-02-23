// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "my-estate-8903c.firebaseapp.com",
  projectId: "my-estate-8903c",
  storageBucket: "my-estate-8903c.appspot.com",
  messagingSenderId: "490147196214",
  appId: "1:490147196214:web:b152b374fd6a0bfa5fd797"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);