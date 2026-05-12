import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAsDph2ISX2ZVBOn1ZbIhG8AdtGPvd6STg",
  authDomain: "auraai-b6bce.firebaseapp.com",
  projectId: "auraai-b6bce",
  storageBucket: "auraai-b6bce.firebasestorage.app",
  messagingSenderId: "846301918452",
  appId: "1:846301918452:web:d2b049554b2ab2f24cdaa1",
  measurementId: "G-4SCVSPLN2G"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Analytics only works in the browser
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then(yes => {
    if (yes) analytics = getAnalytics(app);
  });
}

export { app, db, auth, analytics };
