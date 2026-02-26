import axios from 'axios';
const isLive = false;

const liveUrl = "https://landify-production-backend-services-612299373064.asia-south2.run.app";
const stagingUrl = "https://landify-backend-stagging-services-612299373064.asia-south2.run.app";

// Swagger Credentials for staging/testing environment
const SWAGGER_USERNAME = "landify-dev";
const SWAGGER_PASSWORD = "landify-dev@999";
const basicAuthHeader = `Basic ${btoa(`${SWAGGER_USERNAME}:${SWAGGER_PASSWORD}`)}`;

const api = axios.create({
    baseURL: isLive ? liveUrl : stagingUrl,
    headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'landify-testting-apikey',
        // Add Authorization header for staging environment
        ...(!isLive && { 'Authorization': basicAuthHeader })
    },
});

api.interceptors.request.use(
    (config) => {
        const userPhone = localStorage.getItem('user_phone');
        const token = localStorage.getItem('auth_token');

        if (userPhone && config.headers) {
            config.headers['X-User-Phone'] = userPhone;
        }

        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        } else if (!isLive && config.headers && !config.headers['Authorization']) {
            config.headers['Authorization'] = basicAuthHeader;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;

