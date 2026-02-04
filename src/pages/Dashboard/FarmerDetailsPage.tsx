import React from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
// Remove getFarmerFullDetails
import { getAgentFarmers } from "../../services/userService";
import { fetchProfile } from "../../services/authService";
import { getFarmerLands } from "../../services/landService";
import { UserIcon, EnvelopeIcon, GridIcon, CalenderIcon, AngleLeftIcon } from "../../icons";
import Badge from "../../components/ui/badge/Badge";
import PageMeta from "../../components/common/PageMeta";
import UserTable from "../../components/dashboard/UserTable"; // Re-use UserTable for agent's farmers
import LandDetailsModal from "../../components/dashboard/LandDetailsModal";
import DetailCard from "../../components/common/DetailCard";
import InfoItem from "../../components/common/InfoItem";
import AddLandModal from "../../components/dashboard/AddLandModal";

// Alias available icons to names used in the component
const PhoneIcon = UserIcon;
const LocationIcon = GridIcon;
const ArrowLeftIcon = AngleLeftIcon;

const FarmerDetailsPage: React.FC = () => {
    const { phoneNumber } = useParams<{ phoneNumber: string }>();
    const navigate = useNavigate();
    const [viewLand, setViewLand] = React.useState<any>(null);
    const [resumeLand, setResumeLand] = React.useState<any>(null);
    const [isAddLandOpen, setIsAddLandOpen] = React.useState(false);

    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ["user", phoneNumber],
        queryFn: () => fetchProfile(phoneNumber!),
        enabled: !!phoneNumber,
    });

    const { data: lands, isLoading: isLandsLoading } = useQuery({
        queryKey: ["lands", phoneNumber],
        queryFn: () => getFarmerLands(phoneNumber!),
        enabled: !!phoneNumber && user?.role === 'FARMER',
    });

    const { data: agentFarmers, isLoading: isAgentFarmersLoading } = useQuery({
        queryKey: ["agentFarmers", phoneNumber],
        queryFn: () => getAgentFarmers(phoneNumber!),
        enabled: !!phoneNumber && user?.role === 'AGENT',
    });

    if (isUserLoading || (user?.role === 'FARMER' && isLandsLoading) || (user?.role === 'AGENT' && isAgentFarmersLoading)) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    if (!user) {
        return <div className="p-10 text-center">User not found</div>;
    }

    return (
        <div className="space-y-6 pb-20 max-w-[1400px] mx-auto">
            <PageMeta title={`${user.role === 'AGENT' ? 'Agent' : 'Farmer'} Details - ${user.first_name}`} description="View profile" />

            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2.5 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeftIcon className="size-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{user.role === 'AGENT' ? 'Agent Profile' : 'Farmer Profile'}</h1>
                    <p className="text-sm text-gray-500">Manage information and records</p>
                </div>
            </div>

            {/* Profile Overview */}
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
                <div className="h-12 bg-gray-100 dark:bg-gray-800 relative"></div>
                <div className="px-8 pb-1">
                    <div className="flex flex-col md:flex-row gap-6 items-end -mt-12 mb-6">
                        <div className="size-32 rounded-3xl border-4 border-white dark:border-gray-900 overflow-hidden bg-white shadow-xl">
                            <img
                                src={user.user_photo_url || "/images/user/owner.jpg"}
                                alt="Profile"
                                className="size-full object-cover"
                                onError={(e) => (e.currentTarget.src = "/images/user/owner.jpg")}
                            />
                        </div>
                        <div className="flex-1 pb-2">
                            <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
                                {user.surname} {user.first_name} {user.last_name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                <Badge color="success" size="md">{user.role}</Badge>
                                <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400">
                                    ID: {user.unique_id || "PENDING"}
                                </span>
                                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                    <LocationIcon className="size-4" />
                                    {user.village}, {user.district}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Section 1: Personal */}
                        <DetailCard title="Personal Details">
                            <div className="grid grid-cols-1 gap-3">
                                <InfoItem label="Phone Number" value={user.phone_number} icon={<PhoneIcon className="size-4" />} />
                                <InfoItem label="Email Address" value={user.email} icon={<EnvelopeIcon className="size-4" />} />
                                <InfoItem label="Gender" value={user.gender} icon={<UserIcon className="size-4" />} />
                                <InfoItem label="Date of Birth" value={user.date_of_birth?.toString()} icon={<CalenderIcon className="size-4" />} />
                            </div>
                        </DetailCard>

                        {/* Section 2: KYC & Address */}
                        <DetailCard title="KYC & Address">
                            <div className="grid grid-cols-1 gap-3">
                                <InfoItem label="Aadhar Number" value={user.aadhar_card_number} />
                                <InfoItem label="Pincode" value={user.pincode} />
                                <InfoItem label="Mandal" value={user.mandal} />
                                <InfoItem label="State" value={user.state} />
                            </div>
                        </DetailCard>

                        {/* Section 3: Bank Details */}
                        <DetailCard title="Bank Information">
                            <div className="grid grid-cols-1 gap-3">
                                <InfoItem label="Account Holder" value={user.account_holder_name} />
                                <InfoItem label="Account Number" value={user.account_number} />
                                <InfoItem label="IFSC Code" value={user.ifsc_code} />
                                <InfoItem label="Bank Name" value={user.bank_name} />
                            </div>
                        </DetailCard>
                    </div>
                </div>
            </div>

            {/* Content based on Role */}
            {user.role === 'AGENT' ? (
                <div className="space-y-4">
                    <UserTable
                        title="Farmers List"
                        users={agentFarmers || []}
                        isLoading={isAgentFarmersLoading}
                        // Disable add actions in view mode
                        onAddClick={undefined}

                    />
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white px-2">
                            Land Records ({lands?.length || 0})
                        </h3>
                        <button
                            onClick={() => setIsAddLandOpen(true)}
                            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                            <span>+</span> Add Land
                        </button>
                    </div>

                    {lands?.length === 0 ? (
                        <div className="p-12 text-center bg-white dark:bg-white/[0.03] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                            <p className="text-gray-500">No land records found for this farmer.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {lands?.map((land: any) => (
                                <div
                                    key={land.id}
                                    onClick={() => {
                                        if (!land.is_step2_completed) {
                                            setResumeLand(land);
                                        } else {
                                            setViewLand(land);
                                        }
                                    }}
                                    className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-xl transition-all duration-300 cursor-pointer"
                                >
                                    <div className="p-5 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="text-[10px] font-black uppercase text-brand-500 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-md">
                                                    Land ID: #{land.id}
                                                </span>
                                                <h4 className="text-lg font-bold text-gray-800 dark:text-white mt-1">
                                                    Survey No: {land.survey_no}
                                                </h4>
                                            </div>
                                            <div className="flex flex-col gap-2 items-end">
                                                <Badge color={land.land_type === "Wet Land" ? "success" : "warning"}>
                                                    {land.land_type}
                                                </Badge>
                                                <Badge
                                                    size="sm"
                                                    color={
                                                        !land.is_step2_completed ? 'warning' :
                                                            land.status === 'PENDING' ? 'warning' :
                                                                land.status.includes('APPROVED') ? 'success' : 'error'
                                                    }
                                                >
                                                    {!land.is_step2_completed ? 'Pending Step 2' : land.status}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <div className="bg-gray-50 dark:bg-white/[0.02] p-3 rounded-2xl text-center">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">Area</p>
                                                <p className="text-sm font-bold text-gray-800 dark:text-white">{land.area_in_acres} Ac</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-white/[0.02] p-3 rounded-2xl text-center">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">Water</p>
                                                <p className="text-sm font-bold text-gray-800 dark:text-white">{land.water_source}</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-white/[0.02] p-3 rounded-2xl text-center">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">Ownership</p>
                                                <p className="text-sm font-bold text-gray-800 dark:text-white">{land.ownership_details}</p>
                                            </div>
                                        </div>

                                        <div className="mt-auto space-y-3">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Coordinates</p>
                                            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 font-mono">
                                                <div className="bg-blue-50/50 dark:bg-blue-500/5 p-2 rounded-lg truncate">TL: {land.tf_latlng || "N/A"}</div>
                                                <div className="bg-blue-50/50 dark:bg-blue-500/5 p-2 rounded-lg truncate">TR: {land.tr_latlng || "N/A"}</div>
                                                <div className="bg-blue-50/50 dark:bg-blue-500/5 p-2 rounded-lg truncate">BL: {land.bl_latlng || "N/A"}</div>
                                                <div className="bg-blue-50/50 dark:bg-blue-500/5 p-2 rounded-lg truncate">BR: {land.br_latlng || "N/A"}</div>
                                            </div>
                                        </div>

                                        {land.ownership_details === "LEASE" && (
                                            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-500/5 rounded-2xl border border-orange-100 dark:border-orange-500/10">
                                                <p className="text-[10px] text-orange-500 font-black uppercase mb-1">Owner Details (Lease)</p>
                                                <p className="text-sm font-bold text-gray-800 dark:text-white">
                                                    {land.owner_first_name} {land.surname}
                                                </p>
                                                <p className="text-xs text-gray-500">Rel: {land.relation} | No: {land.number}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <LandDetailsModal
                isOpen={!!viewLand}
                onClose={() => setViewLand(null)}
                land={viewLand}
            />

            {resumeLand && (
                <AddLandModal
                    isOpen={!!resumeLand}
                    onClose={() => {
                        setResumeLand(null);
                        // Optional: Refetch lands if needed, or rely on react-query invalidation in modal
                    }}
                    farmer={user}
                    initialStep={2}
                    initialLandId={resumeLand.id}
                />
            )}

            <AddLandModal
                isOpen={isAddLandOpen}
                onClose={() => setIsAddLandOpen(false)}
                farmer={user}
            />
        </div>
    );
};

export default FarmerDetailsPage;
