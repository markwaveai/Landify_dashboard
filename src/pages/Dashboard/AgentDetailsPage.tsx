import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getAgentProfile, getAgentFarmers } from "../../services/userService";
import { UserIcon, EnvelopeIcon, GridIcon, CalendarIcon, AngleLeftIcon } from "../../icons";
import Badge from "../../components/ui/badge/Badge";
import PageMeta from "../../components/common/PageMeta";
import UserTable from "../../components/dashboard/UserTable";
import DetailCard from "../../components/common/DetailCard";
import InfoItem from "../../components/common/InfoItem";
import { ImagePreviewModal } from "../../components/ui/modal/ImagePreviewModal";

const PhoneIcon = UserIcon;
const LocationIcon = GridIcon;

export default function AgentDetailsPage() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();

    const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

    const { data: profile, isLoading: isLoadingProfile } = useQuery({
        queryKey: ['agentProfile', userId],
        queryFn: () => getAgentProfile(userId!),
        enabled: !!userId
    });

    const { data: farmers, isLoading: isLoadingFarmers } = useQuery({
        queryKey: ['agentFarmers', profile?.unique_id],
        queryFn: () => getAgentFarmers(profile?.unique_id!),
        enabled: !!profile?.unique_id
    });

    const aggregateStats = useMemo(() => {
        if (!farmers) return { lands: 0, acres: 0 };
        return farmers.reduce((acc: { lands: number; acres: number }, farmer: any) => ({
            lands: acc.lands + (farmer.land_count || 0),
            acres: acc.acres + (farmer.total_acres || 0)
        }), { lands: 0, acres: 0 });
    }, [farmers]);

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
                    className="p-2.5 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 hover:border-brand-200 transition-all text-gray-600"
                >
                    <AngleLeftIcon className="size-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Agent Profile</h1>

                </div>
            </div>

            {/* Profile Overview Card */}
            <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
                <div className="px-8 py-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start mb-6">
                        <div
                            className="size-32 rounded-3xl border-4 border-white dark:border-gray-900 overflow-hidden bg-white shadow-xl min-w-[120px] cursor-pointer relative group"
                            onClick={() => (profile.user_image_url || profile.user_photo_url) && setPreviewImage({ url: profile.user_image_url || profile.user_photo_url, title: 'Profile Photo' })}
                        >
                            {(profile.user_image_url || profile.user_photo_url) ? (
                                <img
                                    src={profile.user_image_url || profile.user_photo_url}
                                    alt="Profile"
                                    className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${profile.first_name}+${profile.last_name}&background=random`)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-brand-50 text-brand-500 text-4xl font-black uppercase">
                                    {profile.first_name?.[0]}
                                </div>
                            )}
                            {(profile.user_image_url || profile.user_photo_url) && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-[10px] font-bold uppercase">View</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 pb-2 md:mt-15">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
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
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Farmers</p>
                                    <p className="text-xl font-bold text-gray-800 dark:text-white">{isLoadingFarmers ? "..." : (farmers?.length || 0)}</p>
                                </div>
                                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Lands</p>
                                    <p className="text-xl font-bold text-gray-800 dark:text-white">{isLoadingFarmers ? "..." : aggregateStats.lands}</p>
                                </div>
                                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Total Acres</p>
                                    <p className="text-xl font-bold text-gray-800 dark:text-white">{isLoadingFarmers ? "..." : aggregateStats.acres.toFixed(1)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Section 1: Personal */}
                        <DetailCard title="Personal Details">
                            <div className="grid grid-cols-1 gap-3">
                                <InfoItem label="Phone Number" value={profile.phone_number} icon={<PhoneIcon className="size-4" />} />
                                <InfoItem label="Alternate Phone" value={profile.alternate_phone_number} icon={<PhoneIcon className="size-4" />} />
                                <InfoItem label="Email Address" value={profile.email} icon={<EnvelopeIcon className="size-4" />} />
                                <InfoItem label="Gender" value={profile.gender} icon={<UserIcon className="size-4" />} />
                                <InfoItem label="Date of Birth" value={profile.date_of_birth} icon={<CalendarIcon className="size-4" />} />
                            </div>
                        </DetailCard>

                        {/* Section 2: KYC & Address */}
                        <DetailCard title="KYC & Address">
                            <div className="grid grid-cols-1 gap-3">
                                <InfoItem label="Reference ID" value={profile.reference_id} />
                                <InfoItem label="Aadhar Number" value={profile.aadhar_card_number} />
                                <InfoItem label="PAN Number" value={profile.pan_number} />
                                <InfoItem
                                    label="Full Address"
                                    value={[
                                        profile.village,
                                        profile.mandal,
                                        profile.district,
                                        profile.state,
                                        profile.pincode
                                    ].filter(Boolean).join(', ')}
                                />
                            </div>
                        </DetailCard>


                        {/* Section 3: Bank Details */}
                        <DetailCard title="Bank Details">
                            <div className="grid grid-cols-1 gap-3">
                                <InfoItem label="Account Holder" value={profile.account_holder} />
                                <InfoItem label="Account Number" value={profile.account_number} />
                                <InfoItem label="IFSC Code" value={profile.ifsc_code} />
                                <InfoItem label="Bank Name" value={profile.bank_name} />
                                <InfoItem label="Branch Name" value={profile.bank_branch} />
                            </div>
                        </DetailCard>
                    </div>

                    {/* Documents Section */}
                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
                            Documents & KYC
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {/* Aadhar Images */}
                            {Array.isArray(profile.aadhar_image_url) ? (
                                profile.aadhar_image_url.map((url: string, index: number) => (
                                    <div key={index} className="space-y-2">
                                        <p className="text-xs font-bold text-gray-500 uppercase">Aadhar {index === 0 ? 'Front' : 'Back'}</p>
                                        <div
                                            onClick={() => setPreviewImage({ url, title: `Aadhar ${index === 0 ? 'Front' : 'Back'}` })}
                                            className="relative aspect-[3/2] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 flex items-center justify-center cursor-pointer group"
                                        >
                                            <img src={url} alt={`Aadhar ${index}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white text-xs font-bold font-sans">Click to view</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : profile.aadhar_image_url ? (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase">Aadhar Card</p>
                                    <div
                                        onClick={() => setPreviewImage({ url: profile.aadhar_image_url, title: 'Aadhar Card' })}
                                        className="relative aspect-[3/2] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 flex items-center justify-center cursor-pointer group"
                                    >
                                        <img src={profile.aadhar_image_url} alt="Aadhar" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-xs font-bold font-sans">Click to view</span>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {/* PAN Image */}
                            {profile.pan_image_url && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase">PAN Card</p>
                                    <div
                                        onClick={() => setPreviewImage({ url: profile.pan_image_url, title: 'PAN Card' })}
                                        className="relative aspect-[3/2] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 flex items-center justify-center cursor-pointer group"
                                    >
                                        <img src={profile.pan_image_url} alt="PAN Card" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-xs font-bold font-sans">Click to view</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Bank Passbook Image */}
                            {profile.bank_passbook_image_url && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase">Bank Passbook</p>
                                    <div
                                        onClick={() => setPreviewImage({ url: profile.bank_passbook_image_url, title: 'Bank Passbook' })}
                                        className="relative aspect-[3/2] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 flex items-center justify-center cursor-pointer group"
                                    >
                                        <img src={profile.bank_passbook_image_url} alt="Bank Passbook" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-xs font-bold font-sans">Click to view</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Farmers ListSection */}
            <div className="space-y-4">
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Assigned Farmers</h3>
                    <p className="text-sm text-gray-500">List of farmers registered under this agent, including their unique enrollment IDs and locations.</p>
                </div>
                <UserTable
                    title="Farmers List"
                    users={farmers || []}
                    isLoading={isLoadingFarmers}
                    onAddClick={undefined}
                    hideStatus={true}
                    hideAction={true}
                    hideLocation={true}
                    centerAlignName={true}
                />
            </div>

            {/* Image Preview Modal */}
            <ImagePreviewModal
                isOpen={!!previewImage}
                onClose={() => setPreviewImage(null)}
                imageUrl={previewImage?.url || ""}
                title={previewImage?.title}
            />
        </div>
    );
}
