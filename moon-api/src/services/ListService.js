import { listRepository } from '../repositories/ListRepository.js';

class ListService {
    constructor(repository) {
        this.repository = repository;
    }

    async getUserLists(userId) {
        if (!userId) {
            throw new Error("Missing userId");
        }
        return await this.repository.getListsByUserId(userId);
    }

    async createNewList(userId, listName) {
        if (!userId || !listName) {
            throw new Error("Missing data to create list");
        }

        const newList = {
            userId: userId,
            name: listName,
            movies: []
        };

        return await this.repository.createList(newList);
    }


    async addMovieToList(listId, movieData) {
        if (!listId || !movieData) {
            throw new Error("Missing listId or movieData");
        }
        return await this.repository.addMovieToList(listId, movieData);
    }

    async updateListName(listId, newName) {
        if (!listId || !newName) throw new Error("Немає даних для оновлення");
        return await this.repository.updateListName(listId, newName);
    }

    async deleteList(listId) {
        if (!listId) throw new Error("Немає ID для видалення");
        return await this.repository.deleteList(listId);
    }

    async removeMovieFromList(listId, tmdbId) {
        if (!listId || !tmdbId) throw new Error("Не вистачає даних для видалення");
        return await this.repository.removeMovieFromList(listId, tmdbId);
    }
}

export const listService = new ListService(listRepository);