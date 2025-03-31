import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth'; // Адрес твоего сервера

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Функция для установки токена в заголовок
export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token', token); // Сохраняем токен в LocalStorage
    } else {
        delete api.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
    }
};

// Регистрация пользователя
export const registerUser = async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
};

// Авторизация пользователя
export const loginUser = async (credentials) => {
    const response = await api.post('/login', credentials);
    if (response.data.token) {
        setAuthToken(response.data.token); // Сохраняем токен
    }
    return response.data;
};

// Получение данных о пользователе
export const getUserData = async () => {
    const response = await api.get('/user');
    return response.data;
};

export default api;
