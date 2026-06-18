const express = require('express');
const axios = require('axios');
const { db } = require('./firebaseAdmin');

const router = express.Router();

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'c8282b948e28647029c446fa9bef20f8';

router.get('/movie/:id', async (req, res) => {
    const movieId = req.params.id;
    const lang = req.query.language || 'uk-UA';
    const shortLang = lang.split('-')[0];

    try {
        // 🔥 1. Основна інформація + кредити (ВАЖЛИВО: append_to_response)
        const movieRes = await axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}`,
            {
                params: {
                    api_key: TMDB_API_KEY,
                    language: lang,
                    append_to_response: 'credits'
                }
            }
        );

        // 🔥 2. Картинки
        const imagesRes = await axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}/images`,
            {
                params: {
                    api_key: TMDB_API_KEY,
                    include_image_language: `${shortLang},en,null`
                }
            }
        );

        const tmdbData = movieRes.data;
        const imagesData = imagesRes.data;

        // 🎬 Режисер
        const director = tmdbData.credits?.crew?.find(
            person => person.job === 'Director'
        );
        const directorName = director?.name || null;

        // 🎭 Актори
        const topCast =
            tmdbData.credits?.cast?.slice(0, 5).map(a => a.name) || [];

        // 🖼️ Постер (локалізація + fallback)
        const localizedPoster =
            imagesData.posters?.find(p => p.iso_639_1 === shortLang)?.file_path ||
            tmdbData.poster_path ||
            null;

        // 🖼️ Backdrop
        const localizedBackdrop =
            imagesData.backdrops?.find(b => b.iso_639_1 === shortLang)?.file_path ||
            tmdbData.backdrop_path ||
            null;

        // 📦 Єдина структура даних
        const baseData = {
            id: tmdbData.id,
            title: tmdbData.title,
            overview: tmdbData.overview,
            poster_path: localizedPoster,
            backdrop_path: localizedBackdrop,
            release_date: tmdbData.release_date,
            genres: tmdbData.genres?.map(g => g.name) || [],
            director: directorName,
            cast: topCast,
            vote_average: tmdbData.vote_average
        };

        // 🔥 Firestore
        const movieRef = db.collection('movies').doc(movieId);
        const doc = await movieRef.get();

        if (doc.exists) {
            // оновлюємо актуальні дані (але НЕ дублюємо все вручну)
            await movieRef.set(baseData, { merge: true });

            return res.json({
                ...doc.data(),
                ...baseData
            });
        } else {
            await movieRef.set(baseData);
            return res.json(baseData);
        }

    } catch (error) {
        console.error('Помилка отримання фільму:', error.message);
        return res.status(500).json({
            error: 'Щось пішло не так при отриманні фільму'
        });
    }
});

module.exports = router;