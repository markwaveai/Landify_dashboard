import axios from 'axios';

const api = axios.create({
    baseURL: 'https://landify-backend-services-612299373064.asia-south2.run.app/', // Live backend URL
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

