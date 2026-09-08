const admin = require("firebase-admin");

let firebaseInitialized = false;

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
  firebaseInitialized = true;
} catch (err) {
  console.error("Firebase Admin failed to initialize:", err.message);
}

const sendPushNotification = async (fcmToken, title, body) => {
  if (!firebaseInitialized || !fcmToken) return;
  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
    });
  } catch (err) {
    console.error("Push notification failed:", err.message);
  }
};

module.exports = { sendPushNotification };