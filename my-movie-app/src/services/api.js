import axios from 'axios';


const api = axios.create({
    baseURL: 'https://moon-z1lm.onrender.com/api', 
});

// ПЕРЕХОПЛЮВАЧ ЗАПИТІВ (Request Interceptor)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ПЕРЕХОПЛЮВАЧ ВІДПОВІДЕЙ (Response Interceptor)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            console.log('Помилка авторизації! Видаляємо токен.');
            localStorage.removeItem('token'); 
            
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;