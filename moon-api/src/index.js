import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { db } from './firebase.js';
import authRoutes from './controllers/AuthController.js';
import swaggerUi from 'swagger-ui-express';
import listRoutes from './routes/listRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/lists', listRoutes);

const swaggerDocument = {
    openapi: "3.0.0",
    info: {
        title: "Moon API",
        version: "1.0.0",
        description: "API для збереження фільмів у додатку Moon. Лабораторні роботи №3 та №4."
    },
    servers: [{ url: "https://moon-z1lm.onrender.com" }],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            }
        }
    },
    security: [{ bearerAuth: [] }],

    paths: {
        "/api/auth/register": {
            post: {
                summary: "Реєстрація нового користувача",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    email: { type: "string", example: "test@moon.com" },
                                    password: { type: "string", example: "superSecret123" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "201": { description: "Користувача успішно зареєстровано (пароль захешовано)" },
                    "400": { description: "Помилка (наприклад, такий email вже існує)" }
                }
            }
        },
        "/api/auth/login": {
            post: {
                summary: "Вхід користувача (отримання JWT токена)",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    email: { type: "string", example: "test@moon.com" },
                                    password: { type: "string", example: "superSecret123" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": { description: "Успішний вхід (повертає токен)" },
                    "401": { description: "Неправильний email або пароль" }
                }
            }
        },
        "/api/auth/google": {
            post: {
                summary: "Вхід через Google",
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" } } } } }
                },
                responses: { "200": { description: "Успішний вхід" } }
            }
        }
    }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'API для додатку Moon успішно працює!' });
});

// 🎬 ОТРИМАННЯ ТА КЕШУВАННЯ ФІЛЬМУ (З ПІДТРИМКОЮ ЛОКАЛІЗАЦІЇ)
// 🎬 ОТРИМАННЯ ТА КЕШУВАННЯ ФІЛЬМУ (З АКТОРСЬКИМ СКЛАДОМ ТА РЕЖИСЕРОМ)
app.get('/api/movie/:id', async (req, res) => {
    const movieId = req.params.id;
    // Беремо мову з запиту
    const lang = req.query.language || 'uk-UA';

    try {
        const TMDB_API_KEY = process.env.TMDB_API_KEY;

        // 🔥 ДОДАНО: &append_to_response=credits
        const tmdbResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=${lang}&append_to_response=credits`
        );
        const tmdbData = tmdbResponse.data;

        // 🔥 Шукаємо режисера
        const director = tmdbData.credits?.crew?.find(person => person.job === 'Director');
        const directorName = director ? director.name : null;

        // 🔥 Шукаємо 5 головних акторів
        const topCast = tmdbData.credits?.cast?.slice(0, 5).map(actor => actor.name) || [];

        const movieRef = db.collection('movies').doc(movieId);
        const doc = await movieRef.get();

        let finalMovieData;

        if (doc.exists) {
            console.log(`Фільм є у Firestore. Оновлюємо тексти мовою: ${lang}`);
            const localData = doc.data();

            finalMovieData = {
                ...localData,
                title: tmdbData.title,
                overview: tmdbData.overview,
                genres: tmdbData.genres.map(g => g.name), // Усі жанри
                director: directorName,
                cast: topCast
            };
        } else {
            console.log('Фільму немає в базі. Зберігаємо...');
            finalMovieData = {
                id: tmdbData.id,
                title: tmdbData.title,
                overview: tmdbData.overview,
                poster_path: tmdbData.poster_path,
                backdrop_path: tmdbData.backdrop_path, // Важливо для твого банера!
                release_date: tmdbData.release_date,
                genres: tmdbData.genres.map(g => g.name),
                director: directorName,
                cast: topCast,
                vote_average: tmdbData.vote_average,
                createdAt: new Date()
            };

            await movieRef.set(finalMovieData);
            console.log('Фільм збережено в Firestore!');
        }

        return res.json(finalMovieData);

    } catch (error) {
        console.error('Помилка при роботі з фільмом:', error);
        res.status(500).json({ error: 'Не вдалося отримати дані фільму' });
    }
});

app.post('/api/movie/:id/rate', async (req, res) => {
    const movieId = req.params.id;
    // Приймаємо додатково title та poster_path від фронтенду
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
            title: title || "Без назви", // Зберігаємо для списку в профілі
            poster_path: poster_path || null, // Зберігаємо для списку в профілі
            updatedAt: new Date()
        });

        console.log(`Користувач ${userId} поставив фільму ${movieId} оцінку ${rating}`);
        res.json({ success: true, message: "Оцінку успішно збережено!" });
    } catch (error) {
        console.error("Помилка збереження оцінки:", error);
        res.status(500).json({ error: "Не вдалося зберегти оцінку" });
    }
});

// 🔍 2. ОТРИМАТИ ОЦІНКУ КОНКРЕТНОГО КОРИСТУВАЧА (GET)
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

// 🗑 3. ВИДАТИ ОЦІНКУ ФІЛЬМУ (DELETE)
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

// 📊 СТАТИСТИКА АДМІНА
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

// 🍿 НОВИНКИ КІНО
app.get('/api/movies/now-playing', async (req, res) => {
    try {
        const TMDB_API_KEY = process.env.TMDB_API_KEY;
        const lang = req.query.language || 'uk-UA';
        const page = req.query.page || 1; // 🔥 Зчитуємо сторінку з URL (за замовчуванням 1)

        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&language=${lang}&page=${page}` // 🔥 Передаємо змінну
        );
        res.json(response.data.results);
    } catch (error) {
        console.error('Помилка отримання новинок:', error);
        res.status(500).json({ error: 'Не вдалося завантажити новинки кіно' });
    }
});

// 🔥 ПОПУЛЯРНІ ФІЛЬМИ
app.get('/api/movies/popular', async (req, res) => {
    try {
        const page = req.query.page || 1;
        // 🔥 Витягуємо мову з URL (якщо немає - ставимо укр за замовчуванням)
        const language = req.query.language || 'uk-UA';

        // Передаємо цю мову в сам TMDB
        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}&language=${language}&page=${page}`
        );

        res.json(response.data.results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
});

// 🍿 4. ОТРИМАТИ ВСІ ОЦІНЕНІ ФІЛЬМИ КОРИСТУВАЧА (Для сторінки профілю)
app.get('/api/users/:userId/ratings', async (req, res) => {
    const userId = req.params.userId; // Тут буде email користувача

    try {
        // Шукаємо в колекції ratings усі документи, де userId збігається з поточним
        const ratingsSnapshot = await db.collection('ratings')
            .where('userId', '==', userId)
            .get();

        const ratedMovies = [];
        ratingsSnapshot.forEach(doc => {
            ratedMovies.push(doc.data());
        });

        // Повертаємо масив оцінених фільмів
        res.json(ratedMovies);
    } catch (error) {
        console.error("Помилка отримання оцінених фільмів користувача:", error);
        res.status(500).json({ error: "Не вдалося завантажити оцінені фільми" });
    }
});

// Отримання середньої оцінки фільму від спільноти MOON
app.get('/api/movie/:id/average', async (req, res) => {
  try {
    const movieId = req.params.id;
    
    // Шукаємо всі оцінки для цього фільму у Firestore
    const ratingsRef = db.collection('ratings');
    // Увага: якщо у базі movieId збережено як число, використай Number(movieId)
    const snapshot = await ratingsRef.where('movieId', '==', movieId).get(); 

    // Якщо ніхто ще не оцінив фільм
    if (snapshot.empty) {
      return res.json({ average: null, count: 0 });
    }

    let sum = 0;
    let count = 0;

    // Проходимося по всіх знайдених документах і сумуємо оцінки
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
    console.log(`Swagger документація: http://localhost:${PORT}/api-docs`);
});