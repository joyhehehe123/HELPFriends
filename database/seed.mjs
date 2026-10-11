import { readFileSync } from 'fs';
import admin from 'firebase-admin';

const key = JSON.parse(readFileSync, './serviceAccountKey.json', 'utf8');
admin.initializeApp({ credential: admin.credential.cert(key)});

const db = admin.firestore();
const auth = admin.auth();

