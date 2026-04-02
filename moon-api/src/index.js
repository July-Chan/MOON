import express from 'express';
import cors from 'cors';
import { db } from './firebase.js';import authRoutes from './controllers/AuthController.js';
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

app.listen(PORT, () => {
    console.log(`Сервер Moon API запущено на http://localhost:${PORT}`);
    console.log(`Swagger документація: http://localhost:${PORT}/api-docs`);
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
