import api from './api';

export interface PaymentStats {
    total_payouts: number;
    pending_approvals: number;
    total_harvest_tons: number;
    unbilled_sessions: number;
}

export interface PaymentRecord {
    id: string;
    farmer_name: string;
    farmer_avatar?: string;
    quantity_tons: number;
    amount: number;
    status: 'Pending' | 'Paid';
    date: string;
}

export const getPaymentStats = async (): Promise<PaymentStats> => {
    const response = await api.get('/crops/');
    const crops = response.data || [];

    let total_payouts = 0;
    let total_harvest_tons = 0;
    let pending_approvals = 0;

    crops.forEach((c: any) => {
        total_payouts += (c.amount || 0);
        total_harvest_tons += (c.no_tones || 0);
        if (c.harvest_status !== 'PAID' && c.harvest_status !== 'COMPLETED') {
            pending_approvals += (c.amount || 0);
        }
    });

    return {
        total_payouts,
        pending_approvals,
        total_harvest_tons,
        unbilled_sessions: crops.filter((c: any) => !c.is_active).length
    };
};

export const getPaymentLedger = async (page: number = 1, limit: number = 10): Promise<{ data: PaymentRecord[], total: number }> => {
    // For a real ledger, we join Crops with Users to get Farmer names
    const [cropsRes, usersRes] = await Promise.all([
        api.get(`/crops/?skip=${(page - 1) * limit}&limit=${limit}`),
        api.get('/users/details')
    ]);

    const crops = cropsRes.data || [];
    const users = usersRes.data || [];

    const data: PaymentRecord[] = crops.map((c: any) => {
        const farmer = users.find((u: any) => u.userId === c.farmerId);
        return {
            id: c.cropHistoryId,
            farmer_name: farmer ? farmer.name : 'Unknown Farmer',
            farmer_avatar: `https://ui-avatars.com/api/?name=${farmer ? farmer.name : 'U'}`,
            quantity_tons: c.no_tones || 0,
            amount: c.amount || 0,
            status: c.harvest_status === 'PAID' ? 'Paid' : 'Pending',
            date: c.createdAt?.split('T')[0] || ''
        };
    });

    return {
        data,
        total: crops.length // Note: The API should ideally return total count for pagination
    };
};
