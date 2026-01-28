import React from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getFarmerFullDetails } from "../../services/userService";
import { getFarmerLands } from "../../services/landService";
import { UserIcon, EnvelopeIcon, GridIcon, CalenderIcon, AngleLeftIcon } from "../../icons";
import Badge from "../../components/ui/badge/Badge";
import PageMeta from "../../components/common/PageMeta";

// Alias available icons to names used in the component
const PhoneIcon = UserIcon;
const LocationIcon = GridIcon;
const ArrowLeftIcon = AngleLeftIcon;

const InfoItem = ({ label, value, icon }: { label: string; value: string | undefined; icon?: React.ReactNode }) => (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl">
        {icon && <div className="text-gray-400">{icon}</div>}
        <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{value || "N/A"}</p>
        </div>
    </div>
);

const DetailCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
        <h3 className="text-lg font-bold mb-5 text-gray-800 dark:text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
            {title}
        </h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const FarmerDetailsPage: React.FC = () => {
    const { phoneNumber } = useParams<{ phoneNumber: string }>();
    const navigate = useNavigate();

    const { data: farmer, isLoading: isFarmerLoading } = useQuery({
        queryKey: ["farmer", phoneNumber],
        queryFn: () => getFarmerFullDetails(phoneNumber!),
        enabled: !!phoneNumber,
    });

    const { data: lands, isLoading: isLandsLoading } = useQuery({
        queryKey: ["lands", phoneNumber],
        queryFn: () => getFarmerLands(phoneNumber!),
        enabled: !!phoneNumber,
    });

    if (isFarmerLoading || isLandsLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    if (!farmer) {
        return <div className="p-10 text-center">Farmer not found</div>;
    }

    return (
        <div className="space-y-6 pb-20 max-w-[1400px] mx-auto">
            <PageMeta title={`Farmer Details - ${farmer.first_name}`} description="View farmer profile and land records" />

            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2.5 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeftIcon className="size-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Farmer Profile</h1>
                    <p className="text-sm text-gray-500">Manage information and land records</p>
                </div>
            </div>

            {/* Profile Overview */}
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
                <div className="h-32 bg-linear-to-r from-brand-500 to-brand-700 relative"></div>
                <div className="px-8 pb-8">
                    <div className="flex flex-col md:flex-row gap-6 items-end -mt-12 mb-6">
                        <div className="size-32 rounded-3xl border-4 border-white dark:border-gray-900 overflow-hidden bg-white shadow-xl">
                            <img
                                src={farmer.user_photo_url || "/images/user/owner.jpg"}
                                alt="Farmer"
                                className="size-full object-cover"
                                onError={(e) => (e.currentTarget.src = "/images/user/owner.jpg")}
                            />
                        </div>
                        <div className="flex-1 pb-2">
                            <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
                                {farmer.surname} {farmer.first_name} {farmer.last_name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                <Badge color="success" size="md">{farmer.role}</Badge>
                                <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400">
                                    ID: {farmer.unique_id || "PENDING"}
                                </span>
                                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                    <LocationIcon className="size-4" />
                                    {farmer.village}, {farmer.district}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Section 1: Personal */}
                        <DetailCard title="Personal Details">
                            <div className="grid grid-cols-1 gap-3">
                                <InfoItem label="Phone Number" value={farmer.phone_number} icon={<PhoneIcon className="size-4" />} />
                                <InfoItem label="Email Address" value={farmer.email} icon={<EnvelopeIcon className="size-4" />} />
                                <InfoItem label="Gender" value={farmer.gender} icon={<UserIcon className="size-4" />} />
                                <InfoItem label="Date of Birth" value={farmer.date_of_birth?.toString()} icon={<CalenderIcon className="size-4" />} />
                            </div>
                        </DetailCard>

                        {/* Section 2: KYC & Address */}
                        <DetailCard title="KYC & Address">
                            <div className="grid grid-cols-1 gap-3">
                                <InfoItem label="Aadhar Number" value={farmer.aadhar_card_number} />
                                <InfoItem label="Pincode" value={farmer.pincode} />
                                <InfoItem label="Mandal" value={farmer.mandal} />
                                <InfoItem label="State" value={farmer.state} />
                            </div>
                        </DetailCard>

                        {/* Section 3: Bank Details */}
                        <DetailCard title="Bank Information">
                            <div className="grid grid-cols-1 gap-3">
                                <InfoItem label="Account Holder" value={farmer.account_holder_name} />
                                <InfoItem label="Account Number" value={farmer.account_number} />
                                <InfoItem label="IFSC Code" value={farmer.ifsc_code} />
                                <InfoItem label="Bank Name" value={farmer.bank_name} />
                            </div>
                        </DetailCard>
                    </div>
                </div>
            </div>

            {/* Lands Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white px-2">
                        Land Records ({lands?.length || 0})
                    </h3>
                </div>

                {lands?.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-white/[0.03] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500">No land records found for this farmer.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {lands?.map((land: any) => (
                            <div key={land.id} className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-xl transition-all duration-300">
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
                                        <Badge color={land.land_type === "Wet Land" ? "success" : "warning"}>
                                            {land.land_type}
                                        </Badge>
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
        </div>
    );
};

export default FarmerDetailsPage;
