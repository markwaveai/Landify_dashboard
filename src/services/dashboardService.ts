import api from './api';

export interface DashboardStats {
    ao_count: number;
    agent_count: number;
    farmer_count: number;
    all_lands_count: number;
    lands_in_acres: number;
    approved_land_count: number;
    pending_land_count: number;
    rejected_land_count: number;
    fodder_in_tons: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
};
