import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCXKyULh-ALifb7V4bLAnvpBGvFt1q-n-c",
  authDomain: "blackball-8143b.firebaseapp.com",
  projectId: "blackball-8143b",
  storageBucket: "blackball-8143b.firebasestorage.app",
  messagingSenderId: "987866285060",
  appId: "1:987866285060:web:b547737a675d2d56c22151"
};


const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
