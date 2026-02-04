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
    const response = await api.post('/users/farmer/process?step=step1', data);
    return response.data;
};

export const getFarmerStep1 = async (uniqueId: string) => {
    const response = await api.get(`/users/farmer/details/${uniqueId}`);
    return response.data;
};

export const updateFarmerStep2 = async (uniqueId: string, data: any) => {
    // Backend expects unique_id in body or as query. We can pass as query for safety if body doesn't have it initially, but payload should usually have it.
    // Adding it to data if not present? Or passing as query param 'unique_id'? 
    // Backend: unique_id = getattr(data, 'unique_id', None) or unique_id argument
    const response = await api.post(`/users/farmer/process?step=step2&unique_id=${uniqueId}`, { ...data, unique_id: uniqueId });
    return response.data;
};

export const getFarmerStep2 = async (uniqueId: string) => {
    const response = await api.get(`/users/farmer/details/${uniqueId}`);
    return response.data;
};

export const updateFarmerStep3 = async (uniqueId: string, data: any) => {
    const response = await api.post(`/users/farmer/process?step=step3&unique_id=${uniqueId}`, { ...data, unique_id: uniqueId });
    return response.data;
};

export const getFarmerStep3 = async (uniqueId: string) => {
    const response = await api.get(`/users/farmer/details/${uniqueId}`);
    return response.data;
};

export const getFarmerFullDetails = async (phoneNumber: string) => {
    const response = await api.get(`/users/farmer/full/${phoneNumber}`);
    return response.data;
};

export const getAgentFarmers = async (phoneNumber: string) => {
    const response = await api.get(`/users/agent/${phoneNumber}/farmers`);
    return response.data;
};

export const createAgentStep1 = async (data: any) => {
    const response = await api.post('/users/agent/process?step=step1', data);
    return response.data;
};

export const updateAgentStep2 = async (uniqueId: string, data: any) => {
    const response = await api.post(`/users/agent/process?step=step2&unique_id=${uniqueId}`, { ...data, unique_id: uniqueId });
    return response.data;
};

export const getAgentProfile = async (phoneNumber: string) => {
    const response = await api.get(`/users/profile/${phoneNumber}`);
    return response.data;
};
