// Firebase Integration for VibeTunes
// Handles user authentication and listening history tracking

// Firebase configuration - Use existing config if available
// Using window-scoped variables to avoid redeclaration errors
window.vibeTunesFirebaseInitialized = window.vibeTunesFirebaseInitialized || false;
window.vibeTunesFirestoreDb = window.vibeTunesFirestoreDb || null;

document.addEventListener('DOMContentLoaded', () => {
  // Check if Firebase SDK is loaded
  if (typeof firebase !== 'undefined') {
    try {
      // Initialize Firebase if not already initialized
      if (!firebase.apps.length) {
        // Use existing config if available, otherwise use default
        if (typeof firebaseConfig === 'undefined') {
          console.warn('No Firebase config found, using placeholder');
          // This is just a placeholder and won't actually work
          window.firebaseConfig = {
            apiKey: "YOUR_API_KEY",
            authDomain: "your-project.firebaseapp.com",
            projectId: "your-project",
            storageBucket: "your-project.appspot.com",
            messagingSenderId: "your-messaging-sender-id",
            appId: "your-app-id"
          };
        }
        
        firebase.initializeApp(window.firebaseConfig);
      }
      
      // Get Firestore instance
      if (firebase.firestore) {
        window.vibeTunesFirestoreDb = firebase.firestore();
      }
      
      window.vibeTunesFirebaseInitialized = true;
      console.log('Firebase initialized successfully');
      
      // Listen for auth state changes
      if (firebase.auth) {
        firebase.auth().onAuthStateChanged(user => {
          if (user) {
            console.log('User signed in:', user.uid);
            initializeUserDocument(user.uid);
          } else {
            console.log('User signed out');
          }
        });
      }
    } catch (e) {
      console.warn('Error initializing Firebase:', e);
    }
  } else {
    console.warn('Firebase SDK not loaded. Using localStorage fallback.');
  }
  
  // Add event listener to audio player to track plays
  const audioPlayer = document.getElementById('audio-player');
  if (audioPlayer) {
    audioPlayer.addEventListener('play', () => {
      // This will be handled by recently-played.js
      // We just need to make sure Firebase is ready
    });
  }
});

// Track song play in user history
async function trackSongPlay(songId) {
  // Skip if Firebase is not initialized
  if (!window.vibeTunesFirebaseInitialized || !window.vibeTunesFirestoreDb) return;
  
  const user = getCurrentUser();
  if (!user) return;
  
  try {
    // Get song data
    const songData = getSongDataFromId(songId);
    if (!songData) return;
    
    const userRef = window.vibeTunesFirestoreDb.collection('users').doc(user.uid);
    
    // Get current user data
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      console.warn('User document does not exist');
      return;
    }
    
    const userData = userDoc.data();
    
    // Update songsPlayed array
    const songsPlayed = userData.songsPlayed || [];
    
    // Remove the song if it already exists in the array
    const filteredSongs = songsPlayed.filter(s => s.id !== songId);
    
    // Add the song to the beginning of the array
    const updatedSongs = [
      {
        id: songId,
        title: songData.title,
        thumbnail: songData.thumbnail,
        timestamp: Date.now()
      },
      ...filteredSongs
    ];
    
    // Limit to 10 most recent songs
    const limitedSongs = updatedSongs.slice(0, 10);
    
    // Update user document
    await userRef.update({
      songsPlayed: limitedSongs,
      minutesListened: firebase.firestore.FieldValue.increment(1/60) // Increment by 1 second
    });
    
    console.log('Song play tracked in Firebase');
  } catch (error) {
    console.error('Error tracking song play:', error);
  }
}

// Get current user
function getCurrentUser() {
  return window.vibeTunesFirebaseInitialized && firebase.auth ? firebase.auth().currentUser : null;
}

// Get user's recently played songs from Firebase
async function getRecentlyPlayedSongs() {
  if (!window.vibeTunesFirebaseInitialized || !window.vibeTunesFirestoreDb) {
    return [];
  }
  
  const user = getCurrentUser();
  if (!user) {
    return [];
  }
  
  try {
    const userRef = window.vibeTunesFirestoreDb.collection('users').doc(user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.warn('User document does not exist');
      return [];
    }
    
    const userData = userDoc.data();
    return userData.songsPlayed || [];
  } catch (error) {
    console.error('Error getting recently played songs:', error);
    return [];
  }
}

// Initialize user document if it doesn't exist
async function initializeUserDocument(userId) {
  if (!window.vibeTunesFirebaseInitialized || !window.vibeTunesFirestoreDb) return;
  
  try {
    const userRef = window.vibeTunesFirestoreDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      const user = getCurrentUser();
      await userRef.set({
        username: user?.displayName || 'User',
        avatarURL: user?.photoURL || '',
        minutesListened: 0,
        songsPlayed: []
      });
      console.log('User document initialized');
    }
  } catch (error) {
    console.error('Error initializing user document:', error);
  }
}

// Helper function to get song data from ID
function getSongDataFromId(songId) {
  if (!songId) return null;
  
  // Extract context and index from the ID
  const [context, indexStr] = songId.split('-');
  const index = parseInt(indexStr, 10);
  
  // Find the song in the appropriate array
  let songArray;
  switch (context) {
    case 'bhojpuri': songArray = window.fixedBhojpuri; break;
    case 'phonk': songArray = window.fixedPhonk; break;
    case 'haryanvi': songArray = window.fixedHaryanvi; break;
    case 'json-bhojpuri': songArray = window.jsonBhojpuriSongs; break;
    case 'json-phonk': songArray = window.jsonPhonkSongs; break;
    case 'json-haryanvi': songArray = window.jsonHaryanviSongs; break;
    default: return null;
  }
  
  return songArray && songArray[index] ? songArray[index] : null;
}
