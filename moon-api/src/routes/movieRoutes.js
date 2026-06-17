const express = require('express');
const axios = require('axios');
const { db } = require('./firebaseAdmin'); // Підключення до Firebase Admin SDK
const router = express.Router();

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'c8282b948e28647029c446fa9bef20f8';

router.get('/movie/:id', async (req, res) => {
    const movieId = req.params.id;
    const lang = req.query.language || 'uk-UA';

    // 🔥 Визначаємо коротку мову для пошуку картинок (uk або en)
    const shortLang = lang.split('-')[0];

    try {
        // 🔥 ДОДАНО: include_image_language, щоб TMDB шукав постери потрібною мовою, а якщо їх немає — давав оригінальні (null)
        const tmdbResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=${lang}&append_to_response=credits&include_image_language=${shortLang},null`
        );
        const tmdbData = tmdbResponse.data;

        // 🔥 ШУКАЄМО РЕЖИСЕРА
        const director = tmdbData.credits?.crew?.find(person => person.job === 'Director');
        const directorName = director ? director.name : null;

        // 🔥 ШУКАЄМО ГОЛОВНИХ АКТОРІВ
        const topCast = tmdbData.credits?.cast?.slice(0, 5).map(actor => actor.name) || [];

        const movieRef = db.collection('movies').doc(movieId);
        const doc = await movieRef.get();

        let finalMovieData;

        if (doc.exists) {
            console.log(`Фільм є у Firestore. Оновлюємо тексти та постери мовою: ${lang}`);
            const localData = doc.data();

            // 🔥 ВИПРАВЛЕНО: Тепер ми беремо СВІЖИЙ poster_path та backdrop_path від TMDB, а не старий з бази
            finalMovieData = {
                ...localData,
                title: tmdbData.title,
                overview: tmdbData.overview,
                genres: tmdbData.genres.map(g => g.name),
                director: directorName,
                cast: topCast,
                poster_path: tmdbData.poster_path,     // Оновлюємо постер!
                backdrop_path: tmdbData.backdrop_path  // Оновлюємо задній фон!
            };

            await movieRef.update({
                title: tmdbData.title,
                overview: tmdbData.overview,
                genres: tmdbData.genres.map(g => g.name),
                director: directorName,
                cast: topCast,
                poster_path: tmdbData.poster_path,
                backdrop_path: tmdbData.backdrop_path
            });

        } else {
            console.log('Фільму немає у Firestore. Зберігаємо в базу...');

            finalMovieData = {
                id: tmdbData.id,
                title: tmdbData.title,
                overview: tmdbData.overview,
                poster_path: tmdbData.poster_path,
                backdrop_path: tmdbData.backdrop_path,
                release_date: tmdbData.release_date,
                genres: tmdbData.genres.map(g => g.name),
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