// ============================================================
// CONFIGURATION FIREBASE — thesouscote
// ============================================================
// Remplacez les valeurs ci-dessous par votre propre configuration Firebase.
// Vous trouverez ces clés dans la console Firebase (Paramètres du Projet -> Vos Applications Web).

const firebaseConfig = {
  apiKey: "AIzaSyC6qS17nAJxqnqF31SfG1dUMjd2k-1LACA",
  authDomain: "thesouscote-a7ff8.firebaseapp.com",
  databaseURL: "https://thesouscote-a7ff8-default-rtdb.firebaseio.com",
  projectId: "thesouscote-a7ff8",
  storageBucket: "thesouscote-a7ff8.firebasestorage.app",
  messagingSenderId: "679078618529",
  appId: "1:679078618529:web:c57a9f9305f44b4e4517e0"
};

// Initialisation de Firebase
let db = null;
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
}
