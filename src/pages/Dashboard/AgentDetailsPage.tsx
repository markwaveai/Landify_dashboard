import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getAgentProfile, getAgentFarmers } from "../../services/userService";
import { UserIcon, EnvelopeIcon, GridIcon, CalendarIcon, AngleLeftIcon, DocsIcon, CheckCircleIcon, CloseIcon } from "../../icons";
import Badge from "../../components/ui/badge/Badge";
import PageMeta from "../../components/common/PageMeta";
import UserTable from "../../components/dashboard/UserTable";
import DetailCard from "../../components/common/DetailCard";
import InfoItem from "../../components/common/InfoItem";

const PhoneIcon = UserIcon;
const LocationIcon = GridIcon;

export default function AgentDetailsPage() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [previewImage, setPreviewImage] = useState<{ url: string, label: string } | null>(null);

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

    const { displayLandCount, displayTotalAcres } = useMemo(() => {
        const totalLands = farmers?.reduce((sum: number, f: any) => sum + (f.land_count || 0), 0) || 0;
        const totalAcres = farmers?.reduce((sum: number, f: any) => sum + (f.total_acres || 0), 0) || 0;

        return {
            displayLandCount: Math.max(profile?.land_count || 0, totalLands),
            displayTotalAcres: Math.max(profile?.total_acres || 0, totalAcres).toFixed(2)
        };
    }, [farmers, profile]);

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

            {/* Land Stats Quick Breakdown */}
            {profile.land_stats && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Active</p>
                        <h4 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">{profile.land_stats.active_lands || 0}</h4>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl border border-orange-100 dark:border-orange-800/50">
                        <p className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-1">Harvest Ready</p>
                        <h4 className="text-xl font-bold text-orange-900 dark:text-orange-100">{profile.land_stats.harvest_ready || 0}</h4>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-2xl border border-purple-100 dark:border-purple-800/50">
                        <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">Approved</p>
                        <h4 className="text-xl font-bold text-purple-900 dark:text-purple-100">{profile.land_stats.approved_lands || 0}</h4>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-2xl border border-yellow-100 dark:border-yellow-800/50">
                        <p className="text-[10px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-widest mb-1">Review</p>
                        <h4 className="text-xl font-bold text-yellow-900 dark:text-yellow-100">{profile.land_stats.review_lands || 0}</h4>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-800/50">
                        <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">Remarks</p>
                        <h4 className="text-xl font-bold text-rose-900 dark:text-rose-100">{profile.land_stats.remarks_lands || 0}</h4>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-800/50">
                        <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">Rejected</p>
                        <h4 className="text-xl font-bold text-red-900 dark:text-red-100">{profile.land_stats.rejected_lands || 0}</h4>
                    </div>
                </div>
            )}

            {/* Profile Overview Card */}
            <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
                <div className="px-8 py-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start mb-6">
                        <div className="size-32 rounded-3xl border-4 border-white dark:border-gray-900 overflow-hidden bg-white shadow-xl min-w-[120px]">
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
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Farmers</p>
                                    <p className="text-xl font-bold text-gray-800 dark:text-white">{isLoadingFarmers ? "..." : (farmers?.length || 0)}</p>
                                </div>
                                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Lands</p>
                                    <p className="text-xl font-bold text-gray-800 dark:text-white">{isLoadingFarmers ? "..." : displayLandCount}</p>
                                </div>
                                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Total Acres</p>
                                    <p className="text-xl font-bold text-gray-800 dark:text-white">{isLoadingFarmers ? "..." : displayTotalAcres}</p>
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
                                <InfoItem label="Date of Birth" value={profile.date_of_birth} icon={<CalendarIcon className="size-4" />} />
                                <InfoItem label="Alternate Phone" value={profile.alternate_phone_number} icon={<PhoneIcon className="size-4" />} />
                            </div>
                        </DetailCard>

                        {/* Section 2: KYC & Address */}
                        <DetailCard title="KYC & Address">
                            <div className="grid grid-cols-1 gap-3">
                                <InfoItem label="Reference ID" value={profile.reference_id} />
                                <InfoItem label="Aadhar Number" value={profile.aadhar_card_number} />
                                <InfoItem label="PAN Number" value={profile.pan_number} />
                                <InfoItem label="Village & ID" value={profile.village && profile.village_id ? `${profile.village} - ${profile.village_id}` : (profile.village || profile.village_id)} />
                                <InfoItem label="Mandal" value={profile.mandal} />
                                <InfoItem label="Pincode" value={profile.pincode} />
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

                    {/* Verification Documents Section */}
                    <div className="mt-12">
                        <div className="flex items-center gap-2 mb-6">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Verification Documents</h3>
                            <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1 ml-2"></div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: "Aadhar Card", url: profile.aadhar_image_url, type: 'ID Proof' },
                                { label: "PAN Card", url: profile.pan_image_url, type: 'Financial' },
                                { label: "Bank Passbook", url: profile.bank_passbook_image_url, type: 'Financial' },
                                { label: "User Photo", url: profile.user_image_url, type: 'Personal' }
                            ].map((doc, i) => (
                                <div
                                    key={i}
                                    className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${doc.url
                                        ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg hover:border-brand-300 hover:-translate-y-1'
                                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 border-dashed opacity-70'
                                        }`}
                                >
                                    <div className="h-40 bg-gray-100 dark:bg-gray-800/80 relative flex items-center justify-center overflow-hidden">
                                        {doc.url ? (
                                            <img src={doc.url} alt={doc.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <DocsIcon className="size-12 text-gray-300 dark:text-gray-600" />
                                        )}
                                        {doc.url && (
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                                <button
                                                    onClick={() => setPreviewImage({ url: doc.url!, label: doc.label })}
                                                    className="p-2.5 bg-white rounded-full text-brand-600 hover:scale-110 transition-transform shadow-lg"
                                                >
                                                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">{doc.type}</p>
                                            {doc.url ? (
                                                <CheckCircleIcon className="size-4 text-green-500" />
                                            ) : (
                                                <div className="size-2.5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm leading-tight">{doc.label}</h4>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
                                            {doc.url ? 'Available for review' : 'No document found'}
                                        </p>
                                    </div>
                                </div>
                            ))}
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
            {previewImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-300"
                    onClick={() => setPreviewImage(null)}
                >
                    <div
                        className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center gap-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute -top-12 right-0 flex items-center gap-6">
                            <h3 className="text-white font-bold text-lg">{previewImage.label}</h3>
                            <button
                                onClick={() => setPreviewImage(null)}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                            >
                                <CloseIcon className="size-6" />
                            </button>
                        </div>
                        <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-gray-900 flex items-center justify-center">
                            <img
                                src={previewImage.url}
                                alt={previewImage.label}
                                className="max-w-full max-h-[80vh] object-contain"
                            />
                        </div>
                        <div className="flex gap-4 mt-2">
                            <a
                                href={previewImage.url}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                Open Original
                            </a>
                            <button
                                onClick={() => setPreviewImage(null)}
                                className="px-6 py-2.5 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors backdrop-blur-md"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
