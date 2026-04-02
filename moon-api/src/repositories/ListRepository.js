import { db } from '../firebase.js';

class ListRepository {

    async getListsByUserId(userId) {
        const snapshot = await db.collection('lists')
            .where('userId', '==', userId)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
    async addMovieToList(listId, movieData) {
        const listRef = db.collection('lists').doc(listId);
        const doc = await listRef.get();

        if (!doc.exists) throw new Error("Папку не знайдено");

        const currentMovies = doc.data().movies || [];

        const isDuplicate = currentMovies.some(movie => movie.tmdbId === movieData.tmdbId);
        if (isDuplicate) {
            throw new Error("Цей фільм вже існує у даному списку");
        }

        currentMovies.push(movieData);

        await listRef.update({ movies: currentMovies });
        return movieData;
    }

    async createList(listData) {
        const newDocRef = await db.collection('lists').add(listData);
        return { id: newDocRef.id, ...listData };
    }

    async updateListName(listId, newName) {
        await db.collection('lists').doc(listId).update({ name: newName });
        return { id: listId, name: newName };
    }

    async deleteList(listId) {
        await db.collection('lists').doc(listId).delete();
        return { id: listId };
    }

    async removeMovieFromList(listId, tmdbId) {
        const listRef = db.collection('lists').doc(listId);
        const doc = await listRef.get();

        if (!doc.exists) throw new Error("Папку не знайдено");

        const currentMovies = doc.data().movies || [];

        const updatedMovies = currentMovies.filter(movie => String(movie.tmdbId) !== String(tmdbId));

        await listRef.update({ movies: updatedMovies });
        return { message: "Фільм видалено" };
    }
}

export const listRepository = new ListRepository();