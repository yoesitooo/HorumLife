import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBJGUnrw9viWi-1y8P9FwkN769nqV2uUzQ",
  authDomain: "horumlife.firebaseapp.com",
  projectId: "horumlife",
  storageBucket: "horumlife.firebasestorage.app",
  messagingSenderId: "327456670848",
  appId: "1:327456670848:web:17ba72e1000851912a1265",
  measurementId: "G-KZN9X01KND"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Use a static user ID since there is no authentication implemented yet
const USER_ID = "default_user_01";

export class FirebaseService {
  private static instance: FirebaseService;

  private constructor() {}

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  public async syncDataToCloud(key: string, data: any): Promise<void> {
    try {
      const docRef = doc(db, "users", USER_ID, "data", key);
      await setDoc(docRef, { value: data, updatedAt: new Date().toISOString() });
    } catch (error) {
      console.error(`Error syncing ${key} to cloud:`, error);
    }
  }

  public async loadDataFromCloud(key: string): Promise<any | null> {
    try {
      const docRef = doc(db, "users", USER_ID, "data", key);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().value;
      }
      return null;
    } catch (error) {
      console.error(`Error loading ${key} from cloud:`, error);
      return null;
    }
  }
}

export const firebaseService = FirebaseService.getInstance();
