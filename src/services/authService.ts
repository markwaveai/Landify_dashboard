import api from './api';

export const login = async (phoneNumber: string, otp: string) => {
    const response = await api.post('/auth/login', { phone_number: phoneNumber, otp });
    return response.data;
};

export const fetchMe = async () => {
    const response = await api.get('/users/me');
    return response.data;
};
