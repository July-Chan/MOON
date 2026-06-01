const express = require('express');
const axios = require('axios');
const { db } = require('./firebaseAdmin'); // Підключення до Firebase Admin SDK
const router = express.Router();

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'c8282b948e28647029c446fa9bef20f8';

router.get('/movie/:id', async (req, res) => {
    const movieId = req.params.id;
    const lang = req.query.language || 'uk-UA';

    try {
        // 🔥 ДОДАНО: &append_to_response=credits, щоб отримати акторів та режисера
        const tmdbResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=${lang}&append_to_response=credits`
        );
        const tmdbData = tmdbResponse.data;

        // 🔥 ШУКАЄМО РЕЖИСЕРА
        // У масиві crew шукаємо людину, чия робота (job) — Director
        const director = tmdbData.credits?.crew?.find(person => person.job === 'Director');
        const directorName = director ? director.name : null;

        // 🔥 ШУКАЄМО ГОЛОВНИХ АКТОРІВ (беремо перших 4-5 для компактності)
        const topCast = tmdbData.credits?.cast?.slice(0, 5).map(actor => actor.name) || [];

        const movieRef = db.collection('movies').doc(movieId);
        const doc = await movieRef.get();

        let finalMovieData;

        if (doc.exists) {
            console.log(`Фільм є у Firestore. Оновлюємо тексти мовою: ${lang}`);
            const localData = doc.data();

            // Підміняємо тексти + додаємо масив УСІХ жанрів, режисера та каст
            finalMovieData = {
                ...localData,
                title: tmdbData.title,
                overview: tmdbData.overview,
                genres: tmdbData.genres.map(g => g.name), // 🔥 Тепер це завжди актуальний масив
                director: directorName,
                cast: topCast
            };

        } else {
            console.log('Фільму немає у Firestore. Зберігаємо в базу...');

            finalMovieData = {
                id: tmdbData.id,
                title: tmdbData.title,
                overview: tmdbData.overview,
                poster_path: tmdbData.poster_path,
                release_date: tmdbData.release_date,
                genres: tmdbData.genres.map(g => g.name), // Зберігаємо як масив рядків
                director: directorName,
                cast: topCast,
                vote_average: tmdbData.vote_average,
                createdAt: new Date()
            };

            await movieRef.set(finalMovieData);
            console.log('Фільм успішно збережено в Firestore!');
        }

        return res.json(finalMovieData);

    } catch (error) {
        console.error('Помилка отримання фільму:', error.message);
        res.status(500).json({ error: 'Щось пішло не так при отриманні фільму' });
    }
});

module.exports = router;