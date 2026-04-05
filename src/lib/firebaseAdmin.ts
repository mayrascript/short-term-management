import "server-only";
import { initializeApp, cert, getApps, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId =
  process.env.FIREBASE_PROJECT_ID ??
  process.env.GCLOUD_PROJECT ??
  process.env.GOOGLE_CLOUD_PROJECT;

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!getApps().length) {
  if (clientEmail && privateKey) {
    initializeApp({
      credential: cert({ projectId: projectId ?? "local-dev", clientEmail, privateKey }),
      ...(projectId ? { projectId } : {}),
    });
  } else {
    initializeApp({
      credential: applicationDefault(),
      ...(projectId ? { projectId } : {}),
    });
  }
}

export const db = getFirestore();

