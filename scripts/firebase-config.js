const firebaseConfig = {
  apiKey: "AIzaSyClIhXAaTVmlqhEPxU49C9w9fDkUag-1eQ",
  authDomain: "vibe-tunes.firebaseapp.com",
  databaseURL: "https://vibe-tunes-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "vibe-tunes",
  storageBucket: "vibe-tunes.firebasestorage.app",
  messagingSenderId: "792892627539",
  appId: "1:792892627539:web:69817da08d2d4741a404a6",
  measurementId: "G-7RQD85KP8Z"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();