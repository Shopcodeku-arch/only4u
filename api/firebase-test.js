
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export default async function handler(req, res) {
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!raw) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT tidak ditemukan");
    }

    const serviceAccount = JSON.parse(raw);

    const app = getApps().length
      ? getApps()[0]
      : initializeApp({
          credential: cert(serviceAccount)
        });

    const db = getFirestore(app);

    await db.collection("_connection_test").doc("vercel").set({
      connected: true,
      timestamp: new Date()
    });

    return res.status(200).json({
      success: true,
      message: "Firebase Firestore berhasil terhubung!"
    });

  } catch (error) {
    console.error("Firebase Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
        }
