import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000', // Adjust if backend runs on different port
    headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'lanidfy-testting-apikey'
    },
});

api.interceptors.request.use(
    (config) => {
        const userPhone = localStorage.getItem('user_phone');
        if (userPhone && config.headers) {
            config.headers['X-User-Phone'] = userPhone;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;

