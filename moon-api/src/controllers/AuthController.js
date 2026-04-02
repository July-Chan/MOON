import express from 'express';
import { authService } from '../services/AuthService.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email та пароль є обов'язковими поштою" });
        }

        const newUser = await authService.register(email, password);

        res.status(201).json({
            message: 'Користувача успішно зареєстровано',
            user: newUser
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email та пароль є обов'язковими" });
        }

        const token = await authService.login(email, password);

        res.status(200).json({
            message: 'Успішний вхід',
            token: token
        });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

router.post('/google', async (req, res) => {
    try {
        const { email } = req.body;
        const token = await authService.googleLogin(email);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;