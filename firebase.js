// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDcUvDWKS9EqOBVLI4dpz0e1C-9h6TRV2o",
  authDomain: "inventory-management-d32f8.firebaseapp.com",
  projectId: "inventory-management-d32f8",
  storageBucket: "inventory-management-d32f8.appspot.com",
  messagingSenderId: "314217985526",
  appId: "1:314217985526:web:cdef34dc73705671fbc3d7",
  measurementId: "G-ZV6RPR6PLW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

export {firestore, auth};