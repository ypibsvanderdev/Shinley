// ============================================================
//  SHINLEY AUTH + FIREBASE SYSTEM
//  Firebase Auth (Google Sign-In) + Firestore
// ============================================================

// --- FIREBASE CONFIG ---
// TODO: Replace with your real Firebase config from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCAMpTWtNE0pBh5XIHayqrx3Smlv7apmVE",
  authDomain: "shinley-windows.firebaseapp.com",
  projectId: "shinley-windows",
  storageBucket: "shinley-windows.firebasestorage.app",
  messagingSenderId: "770706499851",
  appId: "1:770706499851:web:6799c203e6dafcbfab1a0e",
  measurementId: "G-FRWJRXLQCJ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Admin email (lowercase)
const ADMIN_EMAIL = 'meqdad@gmail.com';

// --- AUTH STATE ---
let currentUser = null;
let userProfile = null;

function isAdmin(user) {
  if (!user) return false;
  const email = user.email || user.providerData?.[0]?.email || '';
  return email.toLowerCase() === ADMIN_EMAIL;
}

function getSession() {
  return userProfile;
}

// --- GOOGLE SIGN IN ---
async function signInWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await auth.signInWithPopup(provider);
    return { ok: true, user: result.user };
  } catch (error) {
    console.error('Sign-in error:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      return { ok: false, msg: 'Sign-in cancelled.' };
    }
    return { ok: false, msg: error.message };
  }
}

function signOut() {
  auth.signOut().then(() => {
    currentUser = null;
    userProfile = null;
    window.location.reload();
  });
}

// Alias for legacy code
function logout() { signOut(); }

// --- AUTH STATE LISTENER ---
function onAuthReady(callback) {
  auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    if (user) {
      // Build / fetch user profile from Firestore
      const docRef = db.collection('users').doc(user.uid);
      const doc = await docRef.get();
      if (doc.exists) {
        userProfile = { uid: user.uid, ...doc.data() };
      } else {
        // First sign-in — create user profile
        const profile = {
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          email: user.email,
          phone: user.phoneNumber || '',
          photoURL: user.photoURL || '',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await docRef.set(profile);
        userProfile = { uid: user.uid, ...profile, createdAt: Date.now() };
      }
    } else {
      userProfile = null;
    }
    if (callback) callback(user);
  });
}

// --- FIRESTORE: BOOKINGS ---
async function addBooking(data) {
  const booking = {
    ...data,
    status: 'pending',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  const docRef = await db.collection('bookings').add(booking);
  return { id: docRef.id, ...booking };
}

async function getBookings() {
  const snapshot = await db.collection('bookings').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function updateBookingStatus(bookingId, status) {
  await db.collection('bookings').doc(bookingId).update({ status });
}

async function deleteBooking(bookingId) {
  await db.collection('bookings').doc(bookingId).delete();
}

// --- FIRESTORE: USERS ---
async function getAllUsers() {
  const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
}

async function deleteUser(uid) {
  await db.collection('users').doc(uid).delete();
}
