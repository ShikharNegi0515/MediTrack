/* public/firebase-messaging-sw.js */
/* global importScripts, firebase */

// For Vite + Firebase v9 modular, the SW only needs messaging compat loader OR
// use the new self.importScripts approach:
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCBKtUPmmCSFweMQRaPZL0u87yTFnuCwgg",
    authDomain: "meditrack-a9867.firebaseapp.com",
    projectId: "meditrack-a9867",
    storageBucket: "meditrack-a9867.appspot.com",
    messagingSenderId: "270675580660",
    appId: "1:270675580660:web:6e9aad8c0244d75d6370a1",
});

const messaging = firebase.messaging();

// Show a notification when a push arrives
messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || "MediTrack";
    const options = {
        body: payload.notification?.body || "You have a reminder.",
        icon: "/icon.png",
        data: payload.data || {},
    };
    self.registration.showNotification(title, options);
});
