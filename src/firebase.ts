// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfBgdf_6Vo20QmiwX6fx1X5L0rdnXnt5g",
  authDomain: "markwave-481315.firebaseapp.com",
  projectId: "markwave-481315",
  storageBucket: "markwave-481315.firebasestorage.app",
  messagingSenderId: "612299373064",
  appId: "1:612299373064:web:501cdf0780983d7f0eefbd",
  measurementId: "G-RW0Y75L04L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { app, analytics, storage };
