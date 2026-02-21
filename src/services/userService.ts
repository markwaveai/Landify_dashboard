import api from './api';

const mapUser = (u: any) => {
    if (!u) return null;
    return {
        ...u,
        first_name: u.name?.split(' ')[0] || u.name || "",
        last_name: u.name?.split(' ').slice(1).join(' ') || "",
        phone_number: u.phoneNumber || "",
        unique_id: u.userId,
        village: u.address?.village || u.village || "",
        mandal: u.address?.mandal || u.mandal || "",
        district: u.address?.district || u.district || "",
        state: u.address?.state || u.state || "",
        pincode: u.address?.pincode || u.pincode || "",
        city: u.address?.city || u.city || "",
        address: typeof u.address === 'string' ? u.address : "",
        date_of_birth: u.dob || "",
        // Extra details mapping
        aadhar_card_number: u.extra_details?.aadhar_number || u.aadhar_number || "",
        pan_number: u.extra_details?.pan_number || u.pan_number || "",
        bank_name: u.extra_details?.bank_name || u.bank_name || "",
        account_number: u.extra_details?.bank_account_number || u.account_number || "",
        ifsc_code: u.extra_details?.bank_ifsc_code || u.ifsc_code || "",
        bank_branch: u.extra_details?.bank_branch_name || u.bank_branch || "",
        alternate_phone_number: u.extra_details?.alternate_phone_number || u.alternate_phone_number || "",
        reference_id: u.referenceId || u.reference_id || u.ref_id || u.extra_details?.reference_id || "",
        // Image URLs with robust mapping and "string" placeholder check
        user_image_url: (u.user_image_url || u.extra_details?.user_image_url) === "string" ? "" : (u.user_image_url || u.extra_details?.user_image_url || ""),
        aadhar_image_url: (u.aadhar_image_url || u.extra_details?.aadhar_image_url || u.extra_details?.aadhar_images_url) === "string" ? "" : (u.aadhar_image_url || u.extra_details?.aadhar_image_url || u.extra_details?.aadhar_images_url || ""),
        pan_image_url: (u.pan_image_url || u.extra_details?.pan_image_url || u.extra_details?.pan_url) === "string" ? "" : (u.pan_image_url || u.extra_details?.pan_image_url || u.extra_details?.pan_url || ""),
        bank_passbook_image_url: (u.bank_passbook_image_url || u.extra_details?.bank_passbook_image_url) === "string" ? "" : (u.bank_passbook_image_url || u.extra_details?.bank_passbook_image_url || ""),
        agreement_url: (u.agreement_url || u.extra_details?.agreement_url) === "string" ? "" : (u.agreement_url || u.extra_details?.agreement_url || ""),
        // Stats mapping
        farmer_count: u.extra_details?.no_of_farmers || 0,
        land_count: u.land_stats?.approved_lands || u.no_of_lands || 0,
        active_lands: u.land_stats?.active_lands || 0,
        harvest_ready: u.land_stats?.harvest_ready || 0,
        remarks_lands: u.land_stats?.remarks_lands || 0,
        rejected_lands: u.land_stats?.rejected_lands || 0,
        approved_lands: u.land_stats?.approved_lands || 0,
        review_lands: u.land_stats?.review_lands || 0,
        total_acres: u.no_of_acres || 0,
        role: u.role || u.type || "",
        gender: u.gender || "",
        email: u.email || "",
        is_active: u.isActive ?? u.active ?? u.is_active,
        otp_verified: u.Verified ?? u.isVerified ?? u.otpVerified ?? u.otp_verified,
        status: u.Status || u.status || ""
    };
};


export const getUsersByRole = async (role: string) => {
    try {
        const response = await api.get('/users/role', { params: { role } });
        return (response.data || []).map(mapUser);
    } catch (error) {
        console.error(`Error fetching users for role ${role}:`, error);
        // Fallback to filtering all users if the role endpoint is not available
        const response = await api.get('/users/details');
        return (response.data || []).filter((u: any) => u.role === role).map(mapUser);
    }
};

export const getAOs = async () => {
    return getUsersByRole('FIELD_OFFICER');
};

export const getAgents = async () => {
    return getUsersByRole('AGENT');
};

export const getFarmers = async () => {
    return getUsersByRole('FARMER');
};


// Creation APIs
export const createAO = async (data: any) => {
    const payload = {
        name: `${data.first_name} ${data.last_name}`,
        phoneNumber: data.phone_number,
        role: 'FIELD_OFFICER',
        email: data.email,
        dob: data.date_of_birth,
        gender: data.gender,
        isActive: true,
        address: `${data.village}, ${data.mandal}, ${data.district}, ${data.state} - ${data.pincode}`,
        village: data.village,
        mandal: data.mandal,
        aadhar_images_url: data.aadhar_image_url || "",
        pan_url: data.pan_image_url || "",
        referenceId: data.reference_id || ""
    };
    const response = await api.post('/users/register', payload);
    return mapUser(response.data);
};

export const createAgent = async (data: any) => {
    const payload = {
        name: `${data.first_name} ${data.last_name}`,
        phoneNumber: data.phone_number,
        role: 'AGENT',
        email: data.email,
        dob: data.date_of_birth,
        address: {
            village: data.village,
            mandal: data.mandal,
            district: data.district,
            state: data.state,
            pincode: data.pincode
        }
    };
    const response = await api.post('/users/register', payload);
    return mapUser(response.data);
};

export const updateAO = async (userId: string, data: any) => {
    const payload = {
        name: `${data.first_name} ${data.last_name}`,
        phoneNumber: data.phone_number,
        email: data.email,
        dob: data.date_of_birth,
        gender: data.gender,
        isActive: true,
        address: `${data.village}, ${data.mandal}, ${data.district}, ${data.state} - ${data.pincode}`,
        village: data.village,
        mandal: data.mandal,
        aadhar_images_url: data.aadhar_image_url || "",
        pan_url: data.pan_image_url || "",
        referenceId: data.reference_id || ""
    };
    const response = await api.put(`/users/${userId}`, payload);
    return mapUser(response.data);
};

export const createFarmerStep1 = async (data: any) => {
    const payload = {
        name: `${data.first_name} ${data.last_name}`,
        phoneNumber: data.phone_number,
        role: 'FARMER',
        email: data.email,
        dob: data.date_of_birth,
        address: {
            village: data.village,
            mandal: data.mandal,
            district: data.district,
            state: data.state,
            pincode: data.pincode
        }
    };
    const response = await api.post('/users/register', payload);
    return mapUser(response.data);
};

export const getFarmerStep1 = async (uniqueId: string) => {
    const response = await api.get(`/users/${uniqueId}`);
    return response.data;
};

export const updateFarmerStep2 = async (uniqueId: string, data: any) => {
    const response = await api.put(`/users/${uniqueId}`, data);
    return response.data;
};

export const getFarmerStep2 = async (uniqueId: string) => {
    const response = await api.get(`/users/${uniqueId}`);
    return response.data;
};

export const updateFarmerStep3 = async (uniqueId: string, data: any) => {
    const response = await api.put(`/users/${uniqueId}`, data);
    return response.data;
};

export const getFarmerStep3 = async (uniqueId: string) => {
    const response = await api.get(`/users/${uniqueId}`);
    return response.data;
};

export const getFarmerFullDetails = async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
    return mapUser(response.data);
};

export const getAgentFarmers = async (userId: string) => {
    const response = await api.get(`/users/reference/${userId}`);
    return (response.data || []).map(mapUser);
};

export const getFarmersByReference = async (referenceId: string) => {
    const response = await api.get(`/users/land-details-by-reference/${referenceId}`);
    return (response.data || []).map(mapUser);
};

export const createAgentStep1 = async (data: any) => {
    return createAgent(data);
};

export const updateAgentStep2 = async (uniqueId: string, data: any) => {
    const response = await api.put(`/users/${uniqueId}`, data);
    return response.data;
};

export const getAgentProfile = async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
    return mapUser(response.data);
};

export const getOfficerProfile = async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
    return mapUser(response.data);
};

