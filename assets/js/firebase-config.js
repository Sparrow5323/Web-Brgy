// Apply saved theme immediately to prevent flash
(function() {
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark-mode-pending');
        document.addEventListener('DOMContentLoaded', function() {
            document.body.classList.add('dark-mode');
        });
    }
})();

// =====================================================
// FIREBASE CONFIGURATION
// =====================================================
const firebaseConfig = {
    apiKey:            "AIzaSyAOlUuw170U6RiEiT2W2B63M3o1KJS25sQ",
    authDomain:        "barangay-damayang-lagi-1e600.firebaseapp.com",
    projectId:         "barangay-damayang-lagi-1e600",
    storageBucket:     "barangay-damayang-lagi-1e600.firebasestorage.app",
    messagingSenderId: "101144881920",
    appId:             "1:101144881920:web:10eea0c1723f4ecef7a1e5"
};

// Initialize Firebase (compat SDK — works with CDN script tags)
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db   = firebase.firestore();

// =====================================================
// AUTH HELPERS
// =====================================================

function requireAuth(callback) {
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = getRootPath() + 'index.php';
        } else {
            callback(user);
        }
    });
}

async function getCurrentUserProfile() {
    const user = auth.currentUser;
    if (!user) return null;
    const snap = await db.collection('users').doc(user.uid).get();
    return snap.exists ? { uid: user.uid, ...snap.data() } : null;
}

async function logout() {
    await auth.signOut();
    window.location.href = getRootPath() + 'index.php';
}

// =====================================================
// UTILITY HELPERS
// =====================================================

function getRootPath() {
    const depth = window.location.pathname.split('/').filter(Boolean).length;
    if (depth <= 2) return './';
    return '../';
}

function showToast(msg, color = '#1e2a1c') {
    const existing = document.getElementById('toastMsg');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.id = 'toastMsg';
    el.className = 'toast-msg';
    el.style.background = color;
    el.innerText = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

function formatDate(ts) {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

function genRefNo(prefix = 'REF') {
    return prefix + '-' + Date.now().toString(36).toUpperCase();
}
