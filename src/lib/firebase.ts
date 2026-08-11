import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBLIcy_4-16bR1yxNrc_n6w4ejh7ei8FR8",
  authDomain: "ai-sample-project-496213.firebaseapp.com",
  projectId: "ai-sample-project-496213",
  storageBucket: "ai-sample-project-496213.firebasestorage.app",
  messagingSenderId: "256789676138",
  appId: "1:256789676138:web:fb0a3d2579306140270a13"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-remixsmartagricu-fa391aac-4311-4054-972c-0920af664074");
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const signInWithGoogleToken = async (idToken: string) => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google token", error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    return result.user;
  } catch (error) {
    console.error("Error signing up with email", error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing in with email", error);
    throw error;
  }
};
