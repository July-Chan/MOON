const express = require('express');
const axios = require('axios');
const { db } = require('./firebaseAdmin'); // Підключення до Firebase Admin SDK
const router = express.Router();

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'c8282b948e28647029c446fa9bef20f8';

router.get('/movie/:id', async (req, res) => {
    const movieId = req.params.id;

    // 1. Зчитуємо мову, яку передає фронтенд (наприклад, /movie/123?language=en-US)
    // Якщо параметр не передано, за замовчуванням ставимо українську
    const lang = req.query.language || 'uk-UA';

    try {
        // 2. ЗАВЖДИ робимо швидкий запит до TMDB, щоб отримати тексти потрібною мовою "на льоту"
        const tmdbResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=${lang}`
        );
        const tmdbData = tmdbResponse.data;

        // 3. Перевіряємо, чи є цей фільм у нашій базі Firestore (для SVD)
        const movieRef = db.collection('movies').doc(movieId);
        const doc = await movieRef.get();

        let finalMovieData;

        if (doc.exists) {
            console.log(`Фільм є у Firestore. Оновлюємо тексти мовою: ${lang}`);

            // Беремо твої локальні дані з бази...
            const localData = doc.data();

            // ...і "на льоту" замінюємо назву та опис на ті, що щойно отримали з TMDB
            finalMovieData = {
                ...localData,
                title: tmdbData.title,
                overview: tmdbData.overview,
            };

        } else {
            console.log('Фільму немає у Firestore. Зберігаємо в базу...');

            // Формуємо об'єкт для збереження в базу (під SVD)
            finalMovieData = {
                id: tmdbData.id,
                title: tmdbData.title, // У базу запишеться мовою першого запиту
                overview: tmdbData.overview,
                poster_path: tmdbData.poster_path,
                release_date: tmdbData.release_date,
                genres: tmdbData.genres.map(g => g.name),
                vote_average: tmdbData.vote_average,
                createdAt: new Date()
            };

            // Зберігаємо у Firestore (старі документи залишаються недоторканими)
            await movieRef.set(finalMovieData);
            console.log('Фільм успішно збережено в Firestore!');
        }

        // 4. Віддаємо фронтенду завжди актуальний перекладений об'єкт
        return res.json(finalMovieData);

    } catch (error) {
        console.error('Помилка отримання фільму:', error.message);
        res.status(500).json({ error: 'Щось пішло не так при отриманні фільму' });
    }
});

module.exports = router;