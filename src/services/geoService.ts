import api from './api';

export interface GeographyItem {
    id: number | string;
    name: string;
}

export const geoService = {
    getStates: async () => {
        const response = await api.get('/geography');
        return response.data;
    },
    getDistricts: async (stateId: string | number) => {
        const response = await api.get(`/geography?state_id=${stateId}`);
        return response.data;
    },
    getMandals: async (districtId: string | number) => {
        const response = await api.get(`/geography?district_id=${districtId}`);
        return response.data;
    },
    getVillages: async (mandalId: string | number) => {
        const response = await api.get(`/geography?mandal_id=${mandalId}`);
        return response.data;
    }
};
