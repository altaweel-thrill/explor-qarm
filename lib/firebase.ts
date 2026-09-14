import {initializeApp,getApps} from 'firebase/app';
import {getAuth,GoogleAuthProvider,signInWithPopup} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
const config={apiKey:process.env.NEXT_PUBLIC_FIREBASE_API_KEY,authDomain:process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,projectId:process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,appId:process.env.NEXT_PUBLIC_FIREBASE_APP_ID};
export const firebaseReady=Object.values(config).every(Boolean);
const app=firebaseReady?(getApps()[0]||initializeApp({...config,storageBucket:process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,messagingSenderId:process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID})):null;
export const auth=app?getAuth(app):null;
export const db=app?getFirestore(app):null;
export const login=()=>auth?signInWithPopup(auth,new GoogleAuthProvider()):Promise.reject(new Error('أضف إعدادات Firebase أولًا'));
