import React, { createContext, useState, useEffect } from 'react';

// Створюємо наш "спільний простір" для стану авторизації
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Стан: чи залогінений користувач (за замовчуванням - ні)
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Як тільки додаток завантажується, перевіряємо, чи є в браузері збережений токен
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    // Функція входу: зберігає токен і каже додатку "ми в системі!"
    const login = (token) => {
        localStorage.setItem('token', token);
        setIsLoggedIn(true);
    };

    // Функція виходу: видаляє токен і каже додатку "ми вийшли"
    const logout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
    };

    // Передаємо ці функції всім сторінкам додатку
    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};