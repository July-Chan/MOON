const express = require('express');
const axios = require('axios');
const { db } = require('./firebaseAdmin'); // Твоє підключення до Firebase Admin SDK
const router = express.Router();

const TMDB_API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb';

router.get('/movie/:id', async (req, res) => {
    const movieId = req.params.id;

    try {
        // 1. Шукаємо фільм у нашій базі Firestore
        const movieRef = db.collection('movies').doc(movieId);
        const doc = await movieRef.get();

        if (doc.exists) {
            console.log('Фільм взято з локальної бази Firestore (Кеш)');
            return res.json(doc.data());
        }

        // 2. Якщо в базі немає, робимо запит до TMDB
        console.log('Фільму немає в базі. Робимо запит до TMDB API...');
        const tmdbResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=uk-UA`
        );

        const tmdbData = tmdbResponse.data;

        // 3. Формуємо чистий об'єкт (зберігаємо тільки те, що треба для сайту та SVD)
        const movieData = {
            id: tmdbData.id,
            title: tmdbData.title,
            overview: tmdbData.overview,
            poster_path: tmdbData.poster_path,
            release_date: tmdbData.release_date,
            genres: tmdbData.genres.map(g => g.name), // зберігаємо масив назв жанрів
            vote_average: tmdbData.vote_average,
            createdAt: new Date() // корисна мітка часу
        };

        // 4. Зберігаємо у Firestore (ID документа = ID фільму в TMDB)
        await movieRef.set(movieData);
        console.log('Фільм успішно збережено в Firestore!');

        // 5. Віддаємо дані на фронтенд
        return res.json(movieData);

    } catch (error) {
        console.error('Помилка отримання фільму:', error);
        res.status(500).json({ error: 'Щось пішло не так' });
    }
});

module.exports = router;