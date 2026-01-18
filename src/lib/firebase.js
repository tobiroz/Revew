import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCD_kM8d5B51Chr6XqWt6jNvUbaehnYsVM",
  authDomain: "app-revew.firebaseapp.com",
  projectId: "app-revew",
  storageBucket: "app-revew.firebasestorage.app",
  messagingSenderId: "379112924528",
  appId: "1:379112924528:web:20426afefaec04f1df5bb5",
  measurementId: "G-J3XGK3WK3S"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios para usar en toda la app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;