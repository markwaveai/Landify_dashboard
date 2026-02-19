import api from './api';

const mapLand = (l: any) => {
    if (!l) return null;
    const commonId = l.id || l.landId || l._id || l.land_id || l.landId;
    const survey = l.survey_number || l.survey_no;
    const acres = l.acres ?? l.area_in_acres;
    const water = l.land_water_source || l.water_source || l.water;
    const type = l.land_type || l.type || l.landType;
    const ownership = l.owner_ship_type || l.ownership_details || l.ownership_type;
    const status = l.status || l.land_status || 'PENDING';

    // Land status logic: remains INACTIVE even after admin approval as per user request
    const landStatus = l.land_status || 'INACTIVE';

    const userId = l.user_id || l.userId;
    const gunta = l.gunta ?? l.guntas ?? l.land_gunta;
    const sents = l.sents ?? l.cents ?? l.cents_in_acres ?? l.land_cents;

    // Handle address parsing
    let addressInfo: any = {};
    if (l.land_address && typeof l.land_address === 'object') {
        addressInfo = {
            state: l.land_address.state || l.state,
            district: l.land_address.district || l.district,
            division: l.land_address.division || l.division,
            mandal: l.land_address.mandal || l.mandal,
            village: l.land_address.village || l.village,
        };
    } else if (typeof l.land_address === 'string' && l.land_address.includes(',')) {
        const parts = l.land_address.split(',').map((s: string) => s.trim());
        // Map parts conservatively: usually Village, Mandal, District, State
        addressInfo = {
            village: parts[0] || l.village,
            mandal: parts[1] || l.mandal,
            district: parts[2] || l.district,
            state: parts[3] || l.state,
            division: l.division
        };
    } else {
        addressInfo = {
            state: l.state,
            district: l.district,
            division: l.division,
            mandal: l.mandal,
            village: l.village,
        };
    }

    return {
        ...l,
        id: commonId,
        landId: commonId,
        survey_no: survey,
        survey_number: survey,
        acres: acres,
        area_in_acres: acres,
        gunta: gunta,
        guntas: gunta,
        sents: sents,
        cents: sents,
        water_source: water,
        land_water_source: water,
        land_type: type,
        landType: type,
        type: type,
        ownership_details: ownership,
        owner_ship_type: ownership,
        status: status,
        land_status: landStatus,
        user_id: userId,
        userId: userId,
        ror_url: l.ror_url || l.ror1b || l.roe || l.roe_url,
        is_step2_completed: !!(l.land_images_url || l.land_urls?.length),
        ...addressInfo
    };
};

export const addLand = async (data: any) => {
    const response = await api.post('/land/', data);
    return response.data;
};

// Wizard compatibility
export const addLandStep1 = async (phoneNumber: string, data: any) => {
    // Map wizard step 1 to full land creation
    // The new API expects everything at once or allows partials.
    // For now, we'll hit the main creation endpoint.
    return addLand({ ...data, phone_number: phoneNumber });
};

export const addLandStep2 = async (landId: string | number, data: any) => {
    return updateLand(landId.toString(), data);
};

export const updateLand = async (landId: string, data: any) => {
    const response = await api.put(`/land/${landId}`, data);
    return response.data;
};

export const getLandDetails = async (landId: string) => {
    // Strip 'LD' or other non-numeric prefixes if present for the API call
    const cleanId = landId.replace(/^\D+/, '');
    try {
        const response = await api.get(`/land/${cleanId}`);
        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        return mapLand(data);
    } catch (error) {
        // Fallback to original ID if clean ID fails
        const response = await api.get(`/land/${landId}`);
        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        return mapLand(data);
    }
};

export const getFarmerLands = async (userId: string) => {
    const response = await api.get(`/land/get/land-details?user_id=${userId}`);
    return (response.data || []).map(mapLand);
};

export const getLands = async () => {
    const response = await api.get('/land/');
    return (response.data || []).map(mapLand);
};

export const deleteLand = async (landId: string) => {
    const response = await api.delete(`/land/${landId}`);
    return response.data;
};

// Re-implementing these for backward compatibility with the new API
export const getLandApprovals = async (status: string) => {
    const response = await api.get('/land/');
    const lands = (response.data || []).map(mapLand);

    if (status === 'pending') {
        return lands.filter((l: any) => l.status && l.status.includes('PENDING'));
    } else if (status === 'approved') {
        return lands.filter((l: any) => l.status === 'FO_APPROVED');
    } else if (status === 'rejected') {
        return lands.filter((l: any) => l.status === 'FO_REJECTED');
    } else if (status) {
        return lands.filter((l: any) => l.status === status);
    }
    return lands;
};

export const approveLandStage1 = async (landId: string | number, data: { action: 'APPROVE' | 'REJECT'; reason?: string }) => {
    const status = data.action === 'APPROVE' ? 'FO_APPROVED' : 'FO_REJECTED';
    const land_status = data.action === 'APPROVE' ? 'INACTIVE' : 'INACTIVE'; // Remains inactive until Admin
    const response = await api.put(`/land/${landId}`, {
        status: status,
        land_status: land_status,
        remarks: data.reason
    });
    return response.data;
};

export const approveLandStage2 = async (landId: string | number, data: { action: 'APPROVE' | 'REJECT'; reason?: string }) => {
    const status = data.action === 'APPROVE' ? 'ADMIN_APPROVED' : 'ADMIN_REJECTED';
    const land_status = 'INACTIVE'; // Keep inactive even after Admin approval
    const response = await api.put(`/land/${landId}`, {
        status: status,
        land_status: land_status,
        remarks: data.reason
    });
    return response.data;
};

