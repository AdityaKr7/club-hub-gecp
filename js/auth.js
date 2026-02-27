/**
 * Authentication Module
 * Handles Firebase authentication (signup, login, logout)
 * Development mode available for testing without Firebase
 */

// ===== DEVELOPMENT MODE TOGGLE =====
// Set to true to use local demo mode (no Firebase needed)
// Set to false to use actual Firebase (requires credentials)
const DEV_MODE = true;

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

// Firebase Configuration
const firebaseConfig = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_FIREBASE_AUTH_DOMAIN',
  projectId: 'YOUR_FIREBASE_PROJECT_ID',
  storageBucket: 'YOUR_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'YOUR_FIREBASE_APP_ID',
};

// Initialize Firebase only if not in dev mode
let app, auth;

if (!DEV_MODE) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

// Dev mode auth listeners
const devAuthListeners = [];

function notifyAuthListeners(user) {
  devAuthListeners.forEach((callback) => callback(user));
}

/**
 * Local storage key for dev mode user
 */
const DEV_USER_KEY = 'club_hub_dev_user';

/**
 * Register a new user (as Student)
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} fullName - User full name
 * @returns {Promise<Object>} User object or error
 */
export async function registerUser(email, password, fullName) {
  if (DEV_MODE) {
    try {
      // Simulate registration with local storage
      const users = JSON.parse(localStorage.getItem('club_hub_users') || '[]');

      if (users.some((u) => u.email === email)) {
        return {
          success: false,
          error: 'This email is already registered',
          code: 'auth/email-already-in-use',
        };
      }

      const newUser = {
        uid: 'user_' + Date.now(),
        email,
        password, // Note: Never store plain passwords in real app!
        displayName: fullName,
      };

      users.push(newUser);
      localStorage.setItem('club_hub_users', JSON.stringify(users));

      return {
        success: true,
        user: {
          uid: newUser.uid,
          email: newUser.email,
          displayName: newUser.displayName,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Production Firebase code
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with full name
    await updateProfile(user, {
      displayName: fullName,
    });

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object or error
 */
export async function loginUser(email, password) {
  if (DEV_MODE) {
    try {
      // Simulate login with local storage
      const users = JSON.parse(localStorage.getItem('club_hub_users') || '[]');
      const user = users.find((u) => u.email === email && u.password === password);

      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password',
          code: 'auth/wrong-password',
        };
      }

      const currentUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      };

      localStorage.setItem(DEV_USER_KEY, JSON.stringify(currentUser));
      notifyAuthListeners(currentUser);

      return {
        success: true,
        user: currentUser,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Production Firebase code
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
}

/**
 * Demo login (Skip login feature)
 * Uses predefined demo account credentials
 * @returns {Promise<Object>} User object or error
 */
export async function demoLogin() {
  if (DEV_MODE) {
    // Dev mode: instant login
    const demoUser = {
      uid: 'demo_user_001',
      email: 'demo@clubhub.local',
      displayName: 'Demo User',
    };

    localStorage.setItem(DEV_USER_KEY, JSON.stringify(demoUser));
    notifyAuthListeners(demoUser);

    return {
      success: true,
      isDemo: true,
      user: demoUser,
    };
  }

  // Production Firebase code
  const demoEmail = 'demo@clubhub.local';
  const demoPassword = 'demo@123456';

  try {
    const userCredential = await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
    const user = userCredential.user;

    return {
      success: true,
      isDemo: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Demo User',
      },
    };
  } catch (error) {
    // If demo account doesn't exist, show helpful error
    return {
      success: false,
      error: 'Demo account not configured. Please use regular login or contact admin.',
      code: error.code,
      isDemo: true,
    };
  }
}

/**
 * Logout current user
 * @returns {Promise<Object>} Success status
 */
export async function logoutUser() {
  if (DEV_MODE) {
    try {
      localStorage.removeItem(DEV_USER_KEY);
      notifyAuthListeners(null);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Production Firebase code
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Listen to authentication state changes
 * @param {Function} callback - Called with user object on auth state change
 */
export function onAuthChange(callback) {
  if (DEV_MODE) {
    // Dev mode: check local storage and set up listener
    const savedUser = localStorage.getItem(DEV_USER_KEY);
    if (savedUser) {
      try {
        callback(JSON.parse(savedUser));
      } catch (e) {
        callback(null);
      }
    } else {
      callback(null);
    }

    // Register callback for future changes
    devAuthListeners.push(callback);
  } else {
    // Production Firebase code
    onAuthStateChanged(auth, (user) => {
      if (user) {
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
      } else {
        callback(null);
      }
    });
  }
}

/**
 * Get current authenticated user
 * @returns {Object|null} Current user or null
 */
export function getCurrentUser() {
  if (DEV_MODE) {
    const savedUser = localStorage.getItem(DEV_USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  }

  return auth.currentUser
    ? {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
      }
    : null;
}

// Export auth instance for other modules (if needed)
export { auth, DEV_MODE };
