import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { db } from './firebase.js';
import authRoutes from './controllers/AuthController.js';
import listRoutes from './routes/listRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/lists', listRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'API для додатку Moon успішно працює!' });
});

app.get('/api/movie/:id', async (req, res) => {
    const movieId = req.params.id;
    const lang = req.query.language || 'uk-UA';
    const shortLang = lang.split('-')[0];

    try {
        const TMDB_API_KEY = process.env.TMDB_API_KEY;

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

        const director = tmdbData.credits?.crew?.find(p => p.job === 'Director');
        const directorName = director?.name || null;

        const topCast = tmdbData.credits?.cast?.slice(0, 5).map(a => a.name) || [];

        const localizedPoster =
            imagesData.posters?.find(p => p.iso_639_1 === shortLang)?.file_path ||
            tmdbData.poster_path ||
            null;

        const localizedBackdrop =
            imagesData.backdrops?.find(b => b.iso_639_1 === shortLang)?.file_path ||
            tmdbData.backdrop_path ||
            null;

        const baseData = {
            id: tmdbData.id,
            lang,
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

        // 🔥 Ось тепер сервер точно побачить цей правильний запис!
        const movieRef = db.collection('movies').doc(`${movieId}_${lang}`);
        await movieRef.set(baseData, { merge: true });

        return res.json(baseData);

    } catch (error) {
        console.error('Помилка при роботі з фільмом:', error);
        return res.status(500).json({ error: 'Не вдалося отримати дані фільму' });
    }
});

app.post('/api/movie/:id/rate', async (req, res) => {
    const movieId = req.params.id;
    const { userId, rating, title, poster_path } = req.body;

    if (!userId || !rating) {
        return res.status(400).json({ error: "ID користувача та оцінка є обов'язковими" });
    }

    try {
        const ratingRef = db.collection('ratings').doc(`${userId}_${movieId}`);

        await ratingRef.set({
            userId,
            movieId,
            rating: Number(rating),
            title: title || "Без назви",
            poster_path: poster_path || null,
            updatedAt: new Date()
        });

        console.log(`Користувач ${userId} поставив фільму ${movieId} оцінку ${rating}`);
        res.json({ success: true, message: "Оцінку успішно збережено!" });
    } catch (error) {
        console.error("Помилка збереження оцінки:", error);
        res.status(500).json({ error: "Не вдалося зберегти оцінку" });
    }
});

app.get('/api/movie/:id/rate/:userId', async (req, res) => {
    const movieId = req.params.id;
    const userId = req.params.userId;

    try {
        const ratingRef = db.collection('ratings').doc(`${userId}_${movieId}`);
        const doc = await ratingRef.get();

        if (doc.exists) {
            return res.json({ rating: doc.data().rating });
        }

        res.json({ rating: 0 });
    } catch (error) {
        console.error("Помилка отримання оцінки фільму:", error);
        res.status(500).json({ error: "Помилка сервера" });
    }
});

app.delete('/api/movie/:id/rate/:userId', async (req, res) => {
    const movieId = req.params.id;
    const userId = req.params.userId;

    try {
        const ratingRef = db.collection('ratings').doc(`${userId}_${movieId}`);
        await ratingRef.delete();
        console.log(`Користувач ${userId} видалив оцінку для фільму ${movieId}`);
        res.json({ success: true, message: "Оцінку успішно видалено!" });
    } catch (error) {
        console.error("Помилка видалення оцінки:", error);
        res.status(500).json({ error: "Не вдалося видалити оцінку" });
    }
});

app.get('/api/admin/stats', async (req, res) => {
    try {
        const listsSnapshot = await db.collection('lists').get();
        const totalLists = listsSnapshot.size;

        const usersSnapshot = await db.collection('users').get();
        const totalUsers = usersSnapshot.size;
        let totalMovies = 0;
        listsSnapshot.forEach(doc => {
            const listData = doc.data();
            if (listData.movies && Array.isArray(listData.movies)) {
                totalMovies += listData.movies.length;
            }
        });

        res.status(200).json({
            users: totalUsers,
            lists: totalLists,
            movies: totalMovies
        });
    } catch (error) {
        res.status(500).json({ error: "Помилка сервера" });
    }
});

app.get('/api/movies/now-playing', async (req, res) => {
    try {
        const TMDB_API_KEY = process.env.TMDB_API_KEY;
        const lang = req.query.language || 'uk-UA';
        const page = req.query.page || 1;

        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&language=${lang}&page=${page}`
        );
        res.json(response.data.results);
    } catch (error) {
        console.error('Помилка отримання новинок:', error);
        res.status(500).json({ error: 'Не вдалося завантажити новинки кіно' });
    }
});

app.get('/api/movies/popular', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const language = req.query.language || 'uk-UA';

        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}&language=${language}&page=${page}`
        );

        res.json(response.data.results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
});

app.get('/api/users/:userId/ratings', async (req, res) => {
    const userId = req.params.userId;

    try {
        const ratingsSnapshot = await db.collection('ratings')
            .where('userId', '==', userId)
            .get();

        const ratedMovies = [];
        ratingsSnapshot.forEach(doc => {
            ratedMovies.push(doc.data());
        });

        res.json(ratedMovies);
    } catch (error) {
        console.error("Помилка отримання оцінених фільмів користувача:", error);
        res.status(500).json({ error: "Не вдалося завантажити оцінені фільми" });
    }
});

app.get('/api/movie/:id/average', async (req, res) => {
  try {
    const movieId = req.params.id;
    
    const ratingsRef = db.collection('ratings');
    const snapshot = await ratingsRef.where('movieId', '==', movieId).get(); 

    if (snapshot.empty) {
      return res.json({ average: null, count: 0 });
    }

    let sum = 0;
    let count = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.rating) {
        sum += data.rating;
        count++;
      }
    });

    const average = count > 0 ? (sum / count) : null;

    res.json({ average: average, count: count });

  } catch (error) {
    console.error("Помилка розрахунку середньої оцінки:", error);
    res.status(500).json({ error: "Помилка сервера" });
  }
});

app.listen(PORT, () => {
    console.log(`Сервер Moon API запущено на http://localhost:${PORT}`);
});