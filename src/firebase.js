import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBY58u9tj8Fr3AHwGvmlxQPZqXzSOwWjDc",
  authDomain: "yum-yum-e7940.firebaseapp.com",
  projectId: "yum-yum-e7940",
  storageBucket: "yum-yum-e7940.firebasestorage.app",
  messagingSenderId: "496837300420",
  appId: "1:496837300420:web:b2235dad993250e6e77991"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);