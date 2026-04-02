import { db } from '../firebase.js';

class UserRepository {
    constructor() {
        this.collection = db.collection('users');
    }

    async findByEmail(email) {
        const snapshot = await this.collection.where('email', '==', email).get();
        if (snapshot.empty) {
            return null;
        }
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }


    async createUser(userData) {
        const docRef = await db.collection('users').add(userData);
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() };
    }


    async create(userData) {
        const docRef = await db.collection('users').add(userData);
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() };
    }
}

export const userRepository = new UserRepository();