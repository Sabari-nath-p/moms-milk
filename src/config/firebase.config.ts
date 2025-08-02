import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

export function initializeFirebaseApp() {
    const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

    if (!fs.existsSync(serviceAccountPath)) {
        throw new Error('Firebase service account file not found!');
    }

    const serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, 'utf8')
    );

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    return admin;
}
