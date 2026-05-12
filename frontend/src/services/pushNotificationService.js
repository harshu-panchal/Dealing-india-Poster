import { messaging, getToken, onMessage } from '../firebase';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const API_URL = import.meta.env.VITE_API_URL;

// Register service worker
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('✅ Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      throw error;
    }
  } else {
    throw new Error('Service Workers are not supported');
  }
}

// Request notification permission
export async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      return true;
    } else {
      console.log('❌ Notification permission denied');
      return false;
    }
  }
  return false;
}

// Get FCM token
export async function getFCMToken() {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
        await registerServiceWorker();
    }
    
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });
    
    if (token) {
      console.log('✅ FCM Token obtained:', token);
      return token;
    } else {
      console.log('❌ No FCM token available');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
    throw error;
  }
}

// Register FCM token with backend
export async function registerFCMToken(forceUpdate = false) {
  try {
    // Check if already registered in this session
    const savedToken = localStorage.getItem('fcm_token_web');
    if (savedToken && !forceUpdate) {
      console.log('FCM token already registered');
      return savedToken;
    }
    
    // Request permission
    const hasPermission = await requestNotificationPermission();
    console.log(`[DEBUG]: Notification permission state: ${hasPermission ? 'GRANTED' : 'DENIED'}`);
    if (!hasPermission) {
      return null;
    }
    
    // Get token
    const token = await getFCMToken();
    if (!token) {
      return null;
    }
    
    // Get auth token from userInfo
    const storedUser = localStorage.getItem('userInfo');
    if (!storedUser) {
        console.warn('User not logged in, skipping FCM registration');
        return null;
    }
    const parsedUser = JSON.parse(storedUser);
    const tokenStr = parsedUser.accessToken;
    
    if (!tokenStr) {
        console.warn('No access token found, skipping FCM registration');
        return null;
    }

    console.log(`[DEBUG]: Attempting to register FCM token with backend: ${token.substring(0, 10)}...`);

    const response = await fetch(`${API_URL}/fcm/tokens/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenStr}`
      },
      body: JSON.stringify({
        token: token,
        platform: 'web'
      })
    });
    
    console.log(`[DEBUG]: FCM registration response status: ${response.status}`);
    
    if (response.ok) {
      localStorage.setItem('fcm_token_web', token);
      console.log('✅ FCM token registered with backend');
      return token;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to register token with backend');
    }
  } catch (error) {
    console.error('❌ Error registering FCM token:', error);
    // Don't throw, we don't want to break the app if notifications fail
    return null;
  }
}

// Remove FCM token from backend
export async function removeFCMToken() {
  try {
    const token = localStorage.getItem('fcm_token_web');
    const storedUser = localStorage.getItem('userInfo');
    
    if (!token || !storedUser) return;
    
    const parsedUser = JSON.parse(storedUser);
    const tokenStr = parsedUser.accessToken;

    await fetch(`${API_URL}/fcm/tokens/remove`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenStr}`
      },
      body: JSON.stringify({
        token: token,
        platform: 'web'
      })
    });
    
    localStorage.removeItem('fcm_token_web');
    console.log('✅ FCM token removed from backend');
  } catch (error) {
    console.error('❌ Error removing FCM token:', error);
  }
}

// Setup foreground notification handler
export function setupForegroundNotificationHandler(handler) {
  onMessage(messaging, (payload) => {
    console.log('📬 Foreground message received:', payload);
    
    // Show browser notification if app is in foreground but user isn't looking at it
    if ('Notification' in window && Notification.permission === 'granted') {
       // Optional: only show if document is hidden
       // if (document.hidden) { ... }
       new Notification(payload.notification.title, {
         body: payload.notification.body,
         icon: payload.notification.icon || '/dealing-india-logo.png',
         data: payload.data
       });
    }
    
    // Call custom handler (e.g. show a toast in UI)
    if (handler) {
      handler(payload);
    }
  });
}

// Initialize push notifications
export async function initializePushNotifications() {
  try {
    await registerServiceWorker();
    // Token will be registered on login or if already logged in
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        await registerFCMToken();
    }
  } catch (error) {
    console.error('Error initializing push notifications:', error);
  }
}
