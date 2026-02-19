import axios from 'axios';
const isLive = false;

const liveUrl = "https://landify-production-backend-services-612299373064.asia-south2.run.app";
const stagingUrl = "https://landify-backend-stagging-services-612299373064.asia-south2.run.app";
const api = axios.create({
    baseURL: isLive ? liveUrl : stagingUrl, // Staging backend URL
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

