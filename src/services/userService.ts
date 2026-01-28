import api from './api';

export const getAOs = async () => {
    const response = await api.get('/users/ao');
    return response.data;
};

export const getAgents = async () => {
    const response = await api.get('/users/agent');
    return response.data;
};

export const getFarmers = async () => {
    const response = await api.get('/users/farmer');
    return response.data;
};


// Creation APIs
export const createAO = async (data: any) => {
    const response = await api.post('/users/ao', data);
    return response.data;
};

export const createAgent = async (data: any) => {
    const response = await api.post('/users/agent', data);
    return response.data;
};

export const createFarmerStep1 = async (data: any) => {
    const response = await api.post('/users/farmer/step1', data);
    return response.data;
};

export const updateFarmerStep2 = async (uniqueId: string, data: any) => {
    const response = await api.put(`/users/farmer/step2/${uniqueId}`, data);
    return response.data;
};
