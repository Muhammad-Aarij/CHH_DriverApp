import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyChAGHcNxVQ7jCV4-9zGH1L32xTJcj-dKg",
  authDomain: "cardio-f3e64.firebaseapp.com",
  projectId: "cardio-f3e64",
  storageBucket: "cardio-f3e64.appspot.com",
  messagingSenderId: "543638142387",
  appId: "1:543638142387:web:79f1e7bb2b9138d6641fc6",
  measurementId: "G-F06Y3Q29JX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
