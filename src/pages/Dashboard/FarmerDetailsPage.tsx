import React from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getFarmerFullDetails } from "../../services/userService";
import { getFarmerLands } from "../../services/landService";
import {
    AngleLeftIcon,
    UserIcon,
    EnvelopeIcon,
    GridIcon,
    CalendarIcon,
    FileIcon,
    TableIcon,
    CheckCircleIcon
} from "../../icons";
import Badge from "../../components/ui/badge/Badge";
import PageMeta from "../../components/common/PageMeta";
import DetailCard from "../../components/common/DetailCard";
import InfoItem from "../../components/common/InfoItem";
import { ImagePreviewModal } from "../../components/ui/modal/ImagePreviewModal";

const FarmerDetailsPage: React.FC = () => {
    const { phoneNumber } = useParams<{ phoneNumber: string }>();
    const navigate = useNavigate();
    const [previewImage, setPreviewImage] = React.useState<{ url: string; title: string } | null>(null);

    const { data: profile, isLoading: isLoadingProfile } = useQuery({
        queryKey: ['farmerProfile', phoneNumber],
        queryFn: () => getFarmerFullDetails(phoneNumber!),
        enabled: !!phoneNumber
    });

    const { data: lands, isLoading: isLoadingLands } = useQuery({
        queryKey: ['farmerLands', profile?.unique_id],
        queryFn: () => getFarmerLands(profile?.unique_id!),
        enabled: !!profile?.unique_id
    });

    if (isLoadingProfile) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Farmer record not found</h2>
                <button onClick={() => navigate(-1)} className="mt-4 text-primary-500 hover:underline">Go Back</button>
            </div>
        );
    }

    // Comprehensive list of verification documents
    const documents = [
        { url: profile.user_image_url, label: "Profile Photo", icon: <UserIcon className="size-4" /> },
        { url: profile.aadhar_image_url, label: "Aadhar Image", icon: <CheckCircleIcon className="size-4" /> },
        { url: profile.pan_image_url, label: "PAN Card", icon: <FileIcon className="size-4" /> },
        { url: profile.bank_passbook_image_url, label: "Bank Passbook", icon: <TableIcon className="size-4" /> },
        { url: profile.agreement_url, label: "Agreement Document", icon: <FileIcon className="size-4" /> },
    ].filter(doc => doc.url);

    return (
        <div className="space-y-6 pb-20 max-w-[1400px] mx-auto px-4 sm:px-6">
            <PageMeta title={`Farmer Details - ${profile.first_name}`} description="View comprehensive farmer enrollment data" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400 dark:hover:bg-white/10 transition-all shadow-sm"
                    >
                        <AngleLeftIcon className="size-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white sm:text-3xl">
                                Farmer Profile
                            </h1>
                            <Badge variant="solid" color={profile.is_active ? 'success' : 'light'}>
                                {profile.is_active ? 'ACTIVE' : 'INACTIVE'}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5 font-medium">Record ID: <span className="text-primary-600">#{profile.unique_id || "N/A"}</span> • {profile.phone_number}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Enrollment Status</p>
                        <Badge variant="solid" color={
                            profile.status && profile.status.toLowerCase().includes('pending') ? 'warning' : 'success'
                        }>
                            {profile.status || 'Verified'}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                {/* Left Section: Personal & KYC (4 cols) */}
                <div className="lg:col-span-4 space-y-6">

                    <DetailCard title="Personal Information">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-primary-50/50 dark:bg-primary-500/5 rounded-2xl border border-primary-100 dark:border-primary-500/10">
                                <div className="h-16 w-16 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-500/20 overflow-hidden shrink-0">
                                    {profile.user_image_url ? (
                                        <img src={profile.user_image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{(profile.first_name?.[0] || 'U').toUpperCase()}</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                        {profile.surname} {profile.first_name} {profile.last_name}
                                    </h3>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Badge size="sm" color={profile.otp_verified ? 'success' : 'warning'}>
                                            {profile.otp_verified ? 'VERIFIED' : 'PENDING'}
                                        </Badge>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{profile.role || 'Farmer'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 px-1">
                                <InfoItem label="Email Address" value={profile.email || "-"} icon={<EnvelopeIcon className="size-4" />} />
                                <InfoItem label="Gender" value={profile.gender || "-"} icon={<UserIcon className="size-4" />} />
                                <InfoItem label="Date of Birth" value={profile.date_of_birth || "-"} icon={<CalendarIcon className="size-4" />} />
                                <InfoItem label="Alt Contact" value={profile.alternate_phone_number || "-"} icon={<UserIcon className="size-4" />} />
                            </div>
                        </div>
                    </DetailCard>

                    <DetailCard title="KYC Identifiers">
                        <div className="grid grid-cols-1 gap-3 px-1">
                            <InfoItem label="Aadhar Card" value={profile.aadhar_card_number} icon={<CheckCircleIcon className="size-4" />} />
                            <InfoItem label="PAN Card" value={profile.pan_number || "-"} icon={<CheckCircleIcon className="size-4" />} />
                            <InfoItem label="Reference ID" value={profile.reference_id || "-"} icon={<GridIcon className="size-4" />} />
                        </div>
                    </DetailCard>

                    <DetailCard title="Primary Address">
                        <div className="grid grid-cols-1 gap-3 px-1">
                            <InfoItem label="Village" value={profile.village} icon={<GridIcon className="size-4" />} />
                            <InfoItem label="City" value={profile.city || "-"} icon={<GridIcon className="size-4" />} />
                            <InfoItem label="Mandal" value={profile.mandal} icon={<GridIcon className="size-4" />} />
                            <InfoItem label="District" value={profile.district} icon={<GridIcon className="size-4" />} />
                            <InfoItem label="State" value={profile.state} icon={<GridIcon className="size-4" />} />
                            <InfoItem label="Pincode" value={profile.pincode} icon={<GridIcon className="size-4" />} />
                        </div>
                    </DetailCard>
                </div>

                {/* Right Section: Bank, Documents & Lands (8 cols) */}
                <div className="lg:col-span-8 space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DetailCard title="Bank Account Details">
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800/60 transition-all hover:border-primary-200">
                                    <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Bank Name</p>
                                    <p className="text-lg font-bold text-gray-800 dark:text-white">{profile.bank_name || "N/A"}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/60">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Account No</p>
                                        <p className="text-base font-bold text-gray-800 dark:text-white truncate">{profile.account_number || "-"}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/60">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">IFSC Code</p>
                                        <p className="text-base font-bold text-gray-800 dark:text-white">{profile.ifsc_code || "-"}</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/60">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Branch</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-white">{profile.bank_branch || "N/A"}</p>
                                </div>
                            </div>
                        </DetailCard>

                        <DetailCard title="Summary Stats">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center justify-between p-4 bg-primary-600 rounded-2xl text-white shadow-lg shadow-primary-500/20">
                                    <div>
                                        <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Total Lands</p>
                                        <p className="text-3xl font-black mt-1">{isLoadingLands ? "..." : (lands?.length || profile.land_count || 0)}</p>
                                    </div>
                                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                        <GridIcon className="size-8" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-brand-50 dark:bg-brand-500/10 rounded-2xl border border-brand-100 dark:border-brand-500/20">
                                    <div>
                                        <p className="text-xs text-brand-500 font-bold uppercase tracking-widest">Enrollment</p>
                                        <p className="text-xl font-bold text-gray-800 dark:text-white mt-1">{profile.status || "Completed"}</p>
                                    </div>
                                    <div className="text-brand-500">
                                        <CheckCircleIcon className="size-8" />
                                    </div>
                                </div>
                            </div>
                        </DetailCard>
                    </div>

                    {/* Document Verification Gallery */}
                    <DetailCard title="Verification Proofs & Attachments">
                        {documents.length === 0 ? (
                            <div className="p-12 text-center bg-gray-50 dark:bg-gray-800/20 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                <FileIcon className="size-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500 font-medium">No verification documents uploaded yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 lg:gap-6">
                                {documents.map((doc, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setPreviewImage({ url: doc.url!, title: doc.label })}
                                        className="group cursor-pointer"
                                    >
                                        <div className="relative aspect-square rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm group-hover:shadow-md group-hover:border-primary-400 transition-all duration-300">
                                            <img
                                                src={doc.url}
                                                alt={doc.label}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                                            />
                                            <div className="absolute inset-0 bg-primary-600/0 group-hover:bg-primary-600/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <div className="bg-white px-3 py-1.5 rounded-lg text-primary-600 text-[10px] font-black shadow-xl uppercase tracking-widest">
                                                    Preview
                                                </div>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-[10px] text-center font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest truncate px-1">
                                            {doc.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </DetailCard>

                    {lands && lands.length > 0 && (
                        <DetailCard title="Associated Land Records">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-gray-800">
                                            <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Survey No</th>
                                            <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Area</th>
                                            <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Village</th>
                                            <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                        {lands.map((land: any) => (
                                            <tr
                                                key={land.id}
                                                className="group cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5"
                                                onClick={() => navigate(`/land-approvals/${land.id}`)}
                                            >
                                                <td className="py-4 font-bold text-gray-800 dark:text-white text-sm">#{land.survey_no}</td>
                                                <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{land.area_in_acres} Acres</td>
                                                <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{land.village}</td>
                                                <td className="py-4">
                                                    <Badge size="sm" color={land.status?.includes('APPROVED') ? 'success' : 'warning'}>
                                                        {land.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </DetailCard>
                    )}

                </div>
            </div>

            {previewImage && (
                <ImagePreviewModal
                    isOpen={!!previewImage}
                    onClose={() => setPreviewImage(null)}
                    imageUrl={previewImage.url}
                    title={previewImage.title}
                />
            )}
        </div>
    );
};

export default FarmerDetailsPage;
