import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyCBKtUPmmCSFweMQRaPZL0u87yTFnuCwgg",
    authDomain: "meditrack-a9867.firebaseapp.com",
    projectId: "meditrack-a9867",
    storageBucket: "meditrack-a9867.appspot.com",
    messagingSenderId: "270675580660",
    appId: "1:270675580660:web:6e9aad8c0244d75d6370a1",
    measurementId: "G-S1HCG8HD1N"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export { serverTimestamp };

let messaging = null;
let messagingSupported = false;

(async () => {
    messagingSupported = await isSupported();
    if (messagingSupported) {
        messaging = getMessaging(app);
    }
})();

export const getMessagingInstance = () => (messagingSupported ? messaging : null);
export { messagingSupported };

// Request permission + get FCM token
export async function requestNotificationPermission() {
    try {
        if (!messagingSupported) {
            console.warn("FCM is not supported in this browser.");
            return null;
        }

        const vapidKey =
            "BF1xyVpiQ4vRWCh7YQHDZ1CvMlPypvFlm52vJuBFWD_onOCQkRYWksRZi8vmYbnE_VcvqLj6Q1J0q9J7y0Fc-o";
        const token = await getToken(getMessagingInstance(), { vapidKey });
        if (token) {
            console.log("✅ FCM token:", token);
            return token;
        }
        return null;
    } catch (err) {
        console.error("Error getting notification permission/token:", err);
        return null;
    }
}

// Foreground messages
export function subscribeToForegroundMessages() {
    const m = getMessagingInstance();
    if (!m) return;
    onMessage(m, (payload) => {
        console.log("📩 FCM foreground message:", payload);
        alert(payload.notification?.title + ": " + payload.notification?.body);
    });
}

export function onAuthReady() {
    return new Promise((resolve) => {
        const unsub = onAuthStateChanged(auth, (user) => {
            resolve(user || null);
            unsub();
        });
    });
}
