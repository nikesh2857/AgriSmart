import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBLIcy_4-16bR1yxNrc_n6w4ejh7ei8FR8",
  authDomain: "ai-sample-project-496213.firebaseapp.com",
  projectId: "ai-sample-project-496213",
  storageBucket: "ai-sample-project-496213.firebasestorage.app",
  messagingSenderId: "256789676138",
  appId: "1:256789676138:web:fb0a3d2579306140270a13"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-remixsmartagricu-fa391aac-4311-4054-972c-0920af664074");

async function test() {
  try {
    const docRef = await addDoc(collection(db, "tasks"), {
      title: "Test Task",
      status: "completed",
      userId: "test_user"
    });
    console.log("Added doc: " + docRef.id);
    
    await deleteDoc(doc(db, "tasks", docRef.id));
    console.log("Deleted doc: " + docRef.id);
  } catch(e) {
    console.error(e);
  }
}
test();
