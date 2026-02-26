import api from './api';

const mapUser = (u: any) => {
    if (!u) return null;
    let parsedVillage = u.village || u.extra_details?.village || "";
    let parsedMandal = u.mandal || u.extra_details?.mandal || "";
    let parsedDistrict = u.district || "";
    let parsedState = u.state || "";
    let parsedPincode = u.pincode || "";
    let parsedCity = u.city || "";

    if (u.address && typeof u.address === 'object') {
        parsedVillage = u.address.village || parsedVillage;
        parsedMandal = u.address.mandal || parsedMandal;
        parsedDistrict = u.address.district || parsedDistrict;
        parsedState = u.address.state || parsedState;
        parsedPincode = u.address.pincode || parsedPincode;
        parsedCity = u.address.city || parsedCity;
    } else if (typeof u.address === 'string' && u.address.includes(',')) {
        const parts = u.address.split(',').map((s: string) => s.trim());
        if (parts.length >= 4) {
            parsedVillage = parsedVillage || parts[0];
            parsedMandal = parsedMandal || parts[1];
            parsedDistrict = parsedDistrict || parts[2];

            const statePincode = parts.slice(3).join(', ');
            const spParts = statePincode.split('-');

            if (spParts.length >= 2) {
                parsedState = parsedState || spParts[0].trim();
                parsedPincode = parsedPincode || spParts[1].trim();
            } else {
                parsedState = parsedState || statePincode;
            }
        }
    }

    return {
        ...u,
        first_name: u.name?.split(' ')[0] || u.name || "",
        last_name: u.name?.split(' ').slice(1).join(' ') || "",
        phone_number: u.phoneNumber || "",
        unique_id: u.userId,
        village: parsedVillage,
        mandal: parsedMandal,
        district: parsedDistrict,
        state: parsedState,
        pincode: parsedPincode,
        city: parsedCity,
        address: typeof u.address === 'string' ? u.address : "",
        date_of_birth: u.dob || "",
        // Extra details mapping
        aadhar_card_number: u.extra_details?.aadhar_number || u.aadhar_number || "",
        pan_number: u.pan_number || u.panNumber || u.pan_card_number || u.extra_details?.pan_number || u.extra_details?.panNumber || u.extra_details?.pan_card_number || "",
        bank_name: u.extra_details?.bank_name || u.bank_name || "",
        account_number: u.extra_details?.bank_account_number || u.account_number || "",
        ifsc_code: u.extra_details?.bank_ifsc_code || u.ifsc_code || "",
        bank_branch: u.extra_details?.bank_branch_name || u.bank_branch || "",
        account_holder: u.bank_account_name || u.extra_details?.bank_account_name || u.account_holder || u.name || "",
        alternate_phone_number: u.alternate_phone_number || u.alternatePhoneNumber || u.extra_details?.alternate_phone_number || u.extra_details?.alternatePhoneNumber || "",
        reference_id: u.referenceId || u.reference_id || u.ref_id || u.extra_details?.reference_id || "",
        village_id: u.villageId || u.village_id || u.address?.village_id || u.extra_details?.village_id || "",
        // Image URLs with robust mapping and "string" placeholder check
        user_image_url: (u.user_image_url || u.user_photo_url || u.extra_details?.user_image_url || u.extra_details?.user_photo_url) === "string" ? "" : (u.user_image_url || u.user_photo_url || u.extra_details?.user_image_url || u.extra_details?.user_photo_url || ""),
        aadhar_image_url: (u.aadhar_image_url?.front || u.aadhar_images_url?.front || u.aadhar_front || u.extra_details?.aadhar_front || u.extra_details?.aadhar_images_url?.front || ""),
        aadhar_back_image_url: (u.aadhar_image_url?.back || u.aadhar_images_url?.back || u.aadhar_back || u.extra_details?.aadhar_back || u.extra_details?.aadhar_images_url?.back || ""),
        pan_image_url: (u.pan_image_url || u.pan_url || u.extra_details?.pan_image_url || u.extra_details?.pan_url || ""),
        bank_passbook_image_url: (u.bank_passbook_image_url || u.bank_passbook_url || u.extra_details?.bank_passbook_image_url || u.extra_details?.bank_passbook_url || ""),
        agreement_url: (u.agreement_url || u.extra_details?.agreement_url) === "string" ? "" : (u.agreement_url || u.extra_details?.agreement_url || ""),
        // Stats mapping
        farmer_count: u.total_farmers || u.extra_details?.no_of_farmers || 0,
        agent_count: u.total_agents || u.extra_details?.no_of_agents || 0,
        land_count: u.total_lands || u.land_stats?.approved_lands || u.no_of_lands || u.land_count || u.extra_details?.no_of_lands || 0,
        active_lands: u.land_stats?.active_lands || 0,
        harvest_ready: u.land_stats?.harvest_ready || 0,
        remarks_lands: u.land_stats?.remarks_lands || 0,
        rejected_lands: u.land_stats?.rejected_lands || 0,
        approved_lands: u.land_stats?.approved_lands || 0,
        review_lands: u.land_stats?.review_lands || 0,
        land_stats: u.land_stats || {
            active_lands: 0,
            harvest_ready: 0,
            remarks_lands: 0,
            rejected_lands: 0,
            approved_lands: 0,
            review_lands: 0
        },
        total_acres: u.total_acres || u.totalAcres || u.no_of_acres || u.land_stats?.total_acres || u.extra_details?.total_acres || u.extra_details?.no_of_acres || 0,
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
        isActive: data.is_active !== undefined ? data.is_active : true,

        reference_id: data.reference_id,
        aadhar_number: data.aadhar_card_number,
        pan_number: data.pan_card_number,

        bank_account_name: data.bank_account_name,
        bank_account_number: data.bank_account_number,
        bank_name: data.bank_name,
        bank_ifsc_code: data.bank_ifsc_code,
        bank_branch_name: data.bank_branch_name,

        // ✅ IMPORTANT
        address: {
            village: data.village,
            mandal: data.mandal,
            mandal_id: data.mandal_id,
            district: data.district,
            state: data.state,
            pincode: data.pincode
        },

        aadhar_images_url: data.aadhar_image_url || "",
        pan_url: data.pan_image_url || "",
        bank_passbook_image_url: data.bank_passbook_image_url || "",
        user_image_url: data.user_image_url || "",

        status: data.status || "ACTIVE"
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
        isActive: data.is_active !== undefined ? data.is_active : true,
        status: data.status || "ACTIVE",
        user_image_url: data.user_image_url || "",
        address: {
            village: data.village,
            mandal: data.mandal,
            mandal_id: data.mandal_id,
            district: data.district,
            state: data.state,
            pincode: data.pincode
        },
        aadhar_images_url: data.aadhar_image_url || "",
        pan_url: data.pan_image_url || "",
        referenceId: data.reference_id || "",
        aadhar_number: data.aadhar_card_number,
        pan_number: data.pan_card_number,
        bank_account_name: data.bank_account_name,
        bank_account_number: data.bank_account_number,
        bank_name: data.bank_name,
        bank_ifsc_code: data.bank_ifsc_code,
        bank_branch_name: data.bank_branch_name,
        bank_passbook_image_url: data.bank_passbook_image_url || ""
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
    const response = await api.get(`/users/farmers-by-reference/${referenceId}`);
    return (response.data || []).map(mapUser);
};

export const getAgentsByReference = async (referenceId: string) => {
    const response = await api.get(`/users/agents-by-reference/${referenceId}`);
    return (response.data || []).map(mapUser);
};

export const getUsersByReferenceId = async (referenceId: string) => {
    const response = await api.get(`/users/reference/${referenceId}`);
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

