import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';

const serviceAccount = JSON.parse(
    await readFile(new URL('../serviceAccountKey.json', import.meta.url))
);

// Ініціалізує Firebase з правами адміністратора
initializeApp({
    credential: cert(serviceAccount)
});

// Отримує доступ до бази даних
const db = getFirestore();

console.log(' Підключення до Firebase Firestore успішно встановлено!');

export { db };