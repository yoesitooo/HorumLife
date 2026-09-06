import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User
} from "firebase/auth";

// Read config from environment variables — never hardcode secrets
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export class FirebaseService {
  private static instance: FirebaseService;
  private currentUser: User | null = null;
  private authListeners: ((user: User | null) => void)[] = [];

  private constructor() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.authListeners.forEach(listener => listener(user));
    });
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  // --- Authentication ---

  public async signInWithGoogle(): Promise<User | null> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      if (import.meta.env.DEV) console.error("Google sign-in error:", error);
      return null;
    }
  }

  public async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Sign-out error:", error);
    }
  }

  public getUser(): User | null {
    return this.currentUser;
  }

  public onAuthChange(listener: (user: User | null) => void): () => void {
    this.authListeners.push(listener);
    // Immediately call with current state
    listener(this.currentUser);
    return () => {
      this.authListeners = this.authListeners.filter(l => l !== listener);
    };
  }

  // --- Cloud Data ---

  private getUserId(): string | null {
    return this.currentUser?.uid ?? null;
  }

  public async syncDataToCloud(key: string, data: any): Promise<void> {
    const uid = this.getUserId();
    if (!uid) return; // Not logged in, skip cloud sync silently
    try {
      const docRef = doc(db, "users", uid, "data", key);
      await setDoc(docRef, { value: data, updatedAt: new Date().toISOString() });
    } catch (error) {
      if (import.meta.env.DEV) console.error(`Error syncing ${key} to cloud:`, error);
    }
  }

  public async loadDataFromCloud(key: string): Promise<any | null> {
    const uid = this.getUserId();
    if (!uid) return null;
    try {
      const docRef = doc(db, "users", uid, "data", key);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().value;
      }
      return null;
    } catch (error) {
      if (import.meta.env.DEV) console.error(`Error loading ${key} from cloud:`, error);
      return null;
    }
  }
}

export const firebaseService = FirebaseService.getInstance();
