import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let app: App;

if (!getApps().length) {
  try {
    const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
      ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
      : undefined;

    // Set the environment variable so ADC knows the project ID
    if (!serviceAccount) {
      process.env.GOOGLE_CLOUD_PROJECT = 'ai-sample-project-496213';
    }

    app = initializeApp(
      serviceAccount
        ? { credential: cert(serviceAccount) }
        : { projectId: 'ai-sample-project-496213' } // Allows token verification without ADC
    );
    console.log('[Firebase Admin] Initialized successfully.');
  } catch (err) {
    console.warn('[Firebase Admin] Initialization failed — token verification will not work:', err);
  }
} else {
  app = getApps()[0];
}

export const firebaseAuth = getAuth(app!);
