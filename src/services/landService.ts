import api from './api';

export const addLandStep1 = async (phoneNumber: string, data: any) => {
    const response = await api.post(`/lands/step1/${phoneNumber}`, data);
    return response.data;
};

export const getLandStep1 = async (landId: number) => {
    const response = await api.get(`/lands/step1/${landId}`);
    return response.data;
};

export const addLandStep2 = async (landId: number, data: any) => {
    const response = await api.post(`/lands/step2/${landId}`, data);
    return response.data;
};

export const getLandStep2 = async (landId: number) => {
    const response = await api.get(`/lands/step2/${landId}`);
    return response.data;
};

export const getFarmerLands = async (phoneNumber: string) => {
    const response = await api.get(`/lands/farmer/${phoneNumber}`);
    return response.data;
};
