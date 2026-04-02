import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/UserRepository.js';

const secretKey = 'super_secret_moon_key_123';

class AuthService {
    async register(email, password, role = 'user') {
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('Користувач з таким email вже існує');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = {
            email: email,
            password: hashedPassword,
            role: role
        };

        const savedUser = await userRepository.createUser(newUser);


        const { password: _, ...userWithoutPassword } = savedUser;
        return userWithoutPassword;
    }

    async login(email, password) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Користувача з таким email не знайдено');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Неправильний пароль');
        }



        const token = jwt.sign(
            { id: user.id, role: user.role },
            secretKey,
            { expiresIn: '1h' }
        );

        return token;
    }

    async googleLogin(email) {
        let user = await userRepository.findByEmail(email);

        if (!user) {
            user = await userRepository.create({ email, role: 'user' });
        }

        return jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            secretKey,
            { expiresIn: '1h' }
        );
    }
}

export const authService = new AuthService();