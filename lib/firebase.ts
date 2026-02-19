import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD73yCQb3Gjo93Sfv24OiK7y91CxfnBm-s",
  authDomain: "base-de-zypher.firebaseapp.com",
  projectId: "base-de-zypher",
  storageBucket: "base-de-zypher.firebasestorage.app",
  messagingSenderId: "506829610660",
  appId: "1:506829610660:web:24ac010101fbf78c559031",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
