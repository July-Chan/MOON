const express = require('express');
const axios = require('axios');
const { db } = require('./firebaseAdmin'); // Підключення до Firebase Admin SDK
const router = express.Router();

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'c8282b948e28647029c446fa9bef20f8';

router.get('/movie/:id', async (req, res) => {
    const movieId = req.params.id;
    const lang = req.query.language || 'uk-UA';

    // Визначаємо коротку мову для пошуку картинок (uk або en)
    const shortLang = lang.split('-')[0];

    try {
        // 🔥 ЗМІНА 1: Додали ,images у запит
        const tmdbResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}/images`,
            {
                params: {
                    api_key: TMDB_API_KEY,
                    include_image_language: `${shortLang},en,null`
                }
            }
        );

        const movieResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}`,
            {
                params: {
                    api_key: TMDB_API_KEY,
                    language: lang
                }
            }
        );
        const tmdbData = tmdbResponse.data;

        // Шукаємо режисера
        const director = tmdbData.credits?.crew?.find(person => person.job === 'Director');
        const directorName = director ? director.name : null;

        // Шукаємо головних акторів
        const topCast = tmdbData.credits?.cast?.slice(0, 5).map(actor => actor.name) || [];

        // 🔥 ЗМІНА 2: Витягуємо саме локалізовані картинки з масиву images
        const localizedPoster =
         tmdbData.images?.posters?.find(
         poster => poster.iso_639_1 === shortLang
         )?.file_path
         ||tmdbData.poster_path;

        const localizedBackdrop =
         tmdbData.images?.backdrops?.find(
         backdrop => backdrop.iso_639_1 === shortLang
         )?.file_path
         || tmdbData.backdrop_path;

        const movieRef = db.collection('movies').doc(movieId);
        const doc = await movieRef.get();

        let finalMovieData;

        if (doc.exists) {
            console.log(`Фільм є у Firestore. Оновлюємо тексти та постери мовою: ${lang}`);
            const localData = doc.data();

            console.log("LANG:", lang);
            console.log("TMDB poster:", tmdbData.poster_path);
            console.log("IMAGES:", tmdbData.images.posters.slice(0,5));
            console.log("FINAL poster:", localizedPoster);

            // 🔥 ЗМІНА 3: Використовуємо локалізовані постери для клієнта
            finalMovieData = {
                ...localData,
                title: tmdbData.title,
                overview: tmdbData.overview,
                genres: tmdbData.genres.map(g => g.name),
                director: directorName,
                cast: topCast,
                poster_path: localizedPoster,
                backdrop_path: localizedBackdrop
            };

            // 🔥 ЗМІНА 4: Перезаписуємо базу даних новими локалізованими постерами
            await movieRef.update({
                title: tmdbData.title,
                overview: tmdbData.overview,
                genres: tmdbData.genres.map(g => g.name),
                director: directorName,
                cast: topCast
            });

        } else {
            console.log('Фільму немає у Firestore. Зберігаємо в базу...');

            // 🔥 ЗМІНА 5: Для нових фільмів теж зберігаємо локалізовані постери
            finalMovieData = {
                id: tmdbData.id,
                title: tmdbData.title,
                overview: tmdbData.overview,
                poster_path: localizedPoster,
                backdrop_path: localizedBackdrop,
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