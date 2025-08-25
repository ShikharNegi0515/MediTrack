const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

async function sendNotification(token, title, body) {
    const message = {
        token: token,
        notification: {
            title: title,
            body: body,
        },
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("Successfully sent message:", response);
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

sendNotification(
    "DEVICE_FCM_TOKEN",
    "Medication Reminder 💊",
    "Time to take your Aspirin (2 pills)"
);
