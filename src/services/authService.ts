import api from './api';

export const sendOTP = async (phoneNumber: string) => {
    const response = await api.post('/auth/send-otp', { phone_number: phoneNumber });
    return response.data;
};




export const fetchMe = async () => {
    const response = await api.get('/users/me');
    return response.data;
};

export const fetchProfile = async (phoneNumber: string) => {
    const response = await api.get(`/users/profile/${phoneNumber}`);
    return response.data;
};


