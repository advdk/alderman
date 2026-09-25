// Only the Firebase pieces the game uses. Bundled to public/vendor/firebase.js by `npm run build:firebase`.
export { initializeApp } from 'firebase/app';
export {
  initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, browserPopupRedirectResolver,
  onAuthStateChanged, signInAnonymously, signInWithCredential, signInWithPopup, linkWithPopup, linkWithCredential, deleteUser,
  GoogleAuthProvider, signOut, connectAuthEmulator,
} from 'firebase/auth';
// Firestore Lite: plain request/response, no realtime listeners, a fraction of the size.
export {
  getFirestore, doc, getDoc, setDoc, collection, query, orderBy, limit,
  getDocs, where, getCount, deleteDoc, serverTimestamp, Timestamp, connectFirestoreEmulator,
} from 'firebase/firestore/lite';
