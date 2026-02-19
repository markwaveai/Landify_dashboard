import api from './api';

export const sendOTP = async (phoneNumber: string) => {
    const response = await api.post('/users/send-otp', { mobile: phoneNumber });
    return response.data;
};

export const verifyOTP = async (phoneNumber: string, otp: string) => {
    const response = await api.post('/users/verify-otp', { mobile: phoneNumber, otp: otp });
    return response.data;
};




export const fetchMe = async () => {
    const response = await api.get('/users/me');
    return response.data;
};

export const fetchProfile = async (phoneNumber: string) => {
    const response = await api.get(`/users/mobile/${phoneNumber}`);
    const u = response.data;
    if (!u) return null;

    // Map new API structure to match frontend expectations
    return {
        ...u,
        first_name: u.name?.split(' ')[0] || u.name || "",
        last_name: u.name?.split(' ').slice(1).join(' ') || "",
        phone_number: u.phoneNumber || "",
        unique_id: u.userId,
        village: u.address?.village || "",
        mandal: u.address?.mandal || "",
        district: u.address?.district || "",
        state: u.address?.state || "",
        pincode: u.address?.pincode || "",
        gender: u.gender || "",
        date_of_birth: u.dob || "",
        // Stats mapping
        farmer_count: u.extra_details?.no_of_farmers || 0,
        land_count: u.land_stats?.approved_lands || u.no_of_lands || 0,
        total_acres: u.no_of_acres || 0,
        officer_count: u.extra_details?.no_of_aos || 0,
        agent_count: u.extra_details?.no_of_agents || 0,
        role: u.role === 'FIELD_OFFICER' ? 'AGRICULTURE_OFFICER' : u.role
    };
};


