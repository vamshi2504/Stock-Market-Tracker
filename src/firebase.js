import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAOeCYoDrnTJNFK2IKK05di84mv0rt-iz8",
    authDomain: "stock-market-tracker-bbe44.firebaseapp.com",
    projectId: "stock-market-tracker-bbe44",
    storageBucket: "stock-market-tracker-bbe44.firebasestorage.app",
    messagingSenderId: "489269861741",
    appId: "1:489269861741:web:afe4c3ce2a2c737f6d0e64",
    measurementId: "G-Z66BRYK1LQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);