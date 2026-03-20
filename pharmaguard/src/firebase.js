
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
   apiKey: "AIzaSyBnor3b9bxKZtpB5bynLZLGfXJ5f3TyMAI",
  authDomain: "pharmaguard-ab377.firebaseapp.com",
  projectId: "pharmaguard-ab377",
  storageBucket: "pharmaguard-ab377.firebasestorage.app",
  messagingSenderId: "50830316145",
  appId: "1:50830316145:web:b5ad29e191dc66c64c01d0",
  measurementId: "G-DVEDLWMDS0"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
EOF