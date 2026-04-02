import express from 'express';
import { listService } from '../services/ListService.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const userId = req.query.userId;
        const lists = await listService.getUserLists(userId);
        res.status(200).json(lists);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { userId, name } = req.body;
        const newList = await listService.createNewList(userId, name);
        res.status(201).json(newList);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/:id/movies', async (req, res) => {
    try {
        const listId = req.params.id;
        const movieData = req.body;

        const addedMovie = await listService.addMovieToList(listId, movieData);
        res.status(201).json(addedMovie);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { name } = req.body;
        await listService.updateListName(req.params.id, name);
        res.status(200).json({ message: "Назву оновлено" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await listService.deleteList(req.params.id);
        res.status(200).json({ message: "Папку видалено" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:id/movies/:movieId', async (req, res) => {
    try {
        const listId = req.params.id;
        const tmdbId = req.params.movieId;

        await listService.removeMovieFromList(listId, tmdbId);
        res.status(200).json({ message: "Фільм прибрано з папки" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;