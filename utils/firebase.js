import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  initializeAuth,
  getAuth,
  browserLocalPersistence,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyDlYNxKdOV90eT-oUvT5oAn0FcohlU9vK0",
  authDomain: "epati-web-app-2026.firebaseapp.com",
  projectId: "epati-web-app-2026",
  storageBucket: "epati-web-app-2026.firebasestorage.app",
  messagingSenderId: "1048425978530",
  appId: "1:1048425978530:web:e7611628fd7aefe10c15fb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Platform'a özel auth persistence ayarı
let auth;
if (Platform.OS === 'web') {
  auth = initializeAuth(app, {
    persistence: browserLocalPersistence,
  });
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { app, db, auth };
