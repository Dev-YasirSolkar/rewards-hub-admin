import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
const privateKey = rawPrivateKey
  ? rawPrivateKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n')
  : undefined;

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

let adminApp: App;

if (!getApps().length) {
  if (privateKey && clientEmail && projectId) {
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    adminApp = initializeApp();
  }
} else {
  adminApp = getApps()[0] as App;
}

const adminDb = getFirestore(adminApp);

export { adminDb, adminApp };
