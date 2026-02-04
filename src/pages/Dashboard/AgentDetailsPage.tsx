import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getAgentProfile, getAgentFarmers } from "../../services/userService";
import { UserIcon, EnvelopeIcon, GridIcon, CalenderIcon, AngleLeftIcon } from "../../icons";
import Badge from "../../components/ui/badge/Badge";
import PageMeta from "../../components/common/PageMeta";
import UserTable from "../../components/dashboard/UserTable";
import DetailCard from "../../components/common/DetailCard";
import InfoItem from "../../components/common/InfoItem";

// Icons mapping 
const PhoneIcon = UserIcon;
const LocationIcon = GridIcon;
const ArrowLeftIcon = AngleLeftIcon;

export default function AgentDetailsPage() {
    const { phoneNumber } = useParams();
    const navigate = useNavigate();

    const { data: profile, isLoading: isLoadingProfile } = useQuery({
        queryKey: ['agentProfile', phoneNumber],
        queryFn: () => getAgentProfile(phoneNumber!),
        enabled: !!phoneNumber
    });

    const { data: farmers, isLoading: isLoadingFarmers } = useQuery({
        queryKey: ['agentFarmers', phoneNumber],
        queryFn: () => getAgentFarmers(phoneNumber!),
        enabled: !!phoneNumber
    });

    if (isLoadingProfile) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    if (!profile) {
        return <div className="p-10 text-center">Agent not found</div>;
    }

    return (
        <div className="space-y-6 pb-20 max-w-[1400px] mx-auto">
            <PageMeta title={`${profile.first_name} ${profile.last_name} | Agent Details`} description="Agent Details" />

            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2.5 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeftIcon className="size-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Agent Profile</h1>
                    <p className="text-sm text-gray-500">Manage information and records</p>
                </div>
            </div>

            {/* Profile Overview Card */}
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
                <div className="h-8 bg-gray-100 dark:bg-gray-800 relative"></div>
                <div className="px-8 pb-1">
                    <div className="flex flex-col md:flex-row gap-6 items-start -mt-12 mb-6">
                        <div className="size-32 rounded-3xl border-4 border-white dark:border-gray-900 overflow-hidden bg-white shadow-xl min-w-[120px] md:mt-15">
                            {profile.user_photo_url ? (
                                <img
                                    src={profile.user_photo_url}
                                    alt="Profile"
                                    className="size-full object-cover"
                                    onError={(e) => (e.currentTarget.src = "/images/user/owner.jpg")}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-brand-50 text-brand-500 text-4xl font-bold">
                                    {profile.first_name?.[0]}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 pb-2 md:mt-15">
                            <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
                                {profile.surname}  {profile.first_name} {profile.last_name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                <Badge color="success" size="md">{profile.role.toUpperCase()}</Badge>
                                <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400">
                                    ID: {profile.unique_id || 'PENDING'}
                                </span>
                                {(profile.village || profile.district) && (
                                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                        <LocationIcon className="size-4" />
                                        {[profile.village, profile.district].filter(Boolean).join(', ')}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-6 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Farmers</p>
                                    <p className="text-xl font-bold text-gray-800 dark:text-white">{profile.farmer_count || 0}</p>
                                </div>
                                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Lands</p>
                                    <p className="text-xl font-bold text-gray-800 dark:text-white">{profile.land_count || 0}</p>
                                </div>
                                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Acres</p>
                                    <p className="text-xl font-bold text-gray-800 dark:text-white">{profile.total_acres || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Section 1: Personal */}
                        <DetailCard title="Personal Details">
                            <div className="grid grid-cols-1 gap-3">
                                <InfoItem label="Phone Number" value={profile.phone_number} icon={<PhoneIcon className="size-4" />} />
                                <InfoItem label="Email Address" value={profile.email} icon={<EnvelopeIcon className="size-4" />} />
                                <InfoItem label="Gender" value={profile.gender} icon={<UserIcon className="size-4" />} />
                                <InfoItem label="Date of Birth" value={profile.date_of_birth} icon={<CalenderIcon className="size-4" />} />
                            </div>
                        </DetailCard>

                        {/* Section 2: KYC & Address */}
                        <DetailCard title="KYC & Address">
                            <div className="grid grid-cols-1 gap-3">
                                <InfoItem label="Aadhar Number" value={profile.aadhar_card_number} />
                                <InfoItem label="Pincode" value={profile.pincode} />
                                <InfoItem label="Mandal" value={profile.mandal} />
                                <InfoItem label="State" value={profile.state} />
                            </div>
                        </DetailCard>


                        {/* Section 3: Bank Details */}
                        <DetailCard title="Bank Information">
                            <div className="grid grid-cols-1 gap-3">
                                <InfoItem label="Account Holder" value={profile.account_holder} />
                                <InfoItem label="Account Number" value={profile.account_number} />
                                <InfoItem label="IFSC Code" value={profile.ifsc_code} />
                                <InfoItem label="Bank Name" value={profile.bank_name} />
                            </div>
                        </DetailCard>
                    </div>
                </div>
            </div>

            {/* Farmers List */}
            <div className="space-y-4">
                <UserTable
                    title="Farmers List"
                    users={farmers || []}
                    isLoading={isLoadingFarmers}
                    onAddClick={undefined}
                    hideStatus={true}
                />
            </div>
        </div>
    );
}
