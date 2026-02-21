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
    CheckCircleIcon,
    BoxIcon
} from "../../icons";
import Badge from "../../components/ui/badge/Badge";
import PageMeta from "../../components/common/PageMeta";
import DetailCard from "../../components/common/DetailCard";
import InfoItem from "../../components/common/InfoItem";
import { ImagePreviewModal } from "../../components/ui/modal/ImagePreviewModal";

const PhoneIcon = UserIcon;

const FarmerDetailsPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [previewImage, setPreviewImage] = React.useState<{ url: string; title: string } | null>(null);

    const { data: profile, isLoading: isLoadingProfile } = useQuery({
        queryKey: ['farmerProfile', userId],
        queryFn: () => getFarmerFullDetails(userId!),
        enabled: !!userId
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

            {/* Premium Profile Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4 sm:p-8">
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3 rounded-2xl border border-gray-100 bg-white text-gray-400 hover:text-primary-600 hover:border-primary-100 dark:border-gray-800 dark:bg-white/5 transition-all shadow-sm"
                        >
                            <AngleLeftIcon className="size-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white sm:text-4xl tracking-tight uppercase">
                                    Farmer Profile
                                </h1>
                                <Badge variant="solid" color={profile.is_active ? 'success' : 'light'}>
                                    {profile.is_active ? 'ACTIVE' : 'INACTIVE'}
                                </Badge>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-gray-500">
                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-primary-600 font-bold font-mono uppercase tracking-wider">
                                    ID: {profile.unique_id || "N/A"}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span className="flex items-center gap-1.5">
                                    <PhoneIcon className="size-4" /> {profile.phone_number}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 px-6 py-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest leading-none mb-1.5">Enrollment Status</p>
                            <Badge variant="solid" color={
                                profile.status && profile.status.toLowerCase().includes('pending') ? 'warning' : 'success'
                            }>
                                {profile.status || 'Verified'}
                            </Badge>
                        </div>
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
                        <div className="space-y-6">
                            <DetailCard title="Associated Land Records">
                                <div className="grid grid-cols-1 gap-6">
                                    {lands.map((land: any) => (
                                        <div key={land.id} className="p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02] hover:border-primary-200 transition-all">
                                            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Survey #{land.survey_no}</h4>
                                                        <Badge size="sm" color={land.status?.includes('APPROVED') ? 'success' : 'warning'}>
                                                            {land.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-500 font-medium">{land.village}, {land.mandal}, {land.district}</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <div className="px-3 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center min-w-[50px]">
                                                        <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Acres</p>
                                                        <p className="text-base font-black text-primary-600">{land.acres || 0}</p>
                                                    </div>
                                                    <div className="px-3 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center min-w-[50px]">
                                                        <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Guntas</p>
                                                        <p className="text-base font-black text-primary-600">{land.gunta || 0}</p>
                                                    </div>
                                                    <div className="px-3 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center min-w-[50px]">
                                                        <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Cents</p>
                                                        <p className="text-base font-black text-primary-600">{land.sents || 0}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                                <div className="space-y-3 min-w-0">
                                                    <InfoItem label="Land ID" value={land.landId} icon={<GridIcon className="size-4" />} />
                                                    <InfoItem label="Land Type" value={land.land_type} icon={<GridIcon className="size-4" />} />
                                                    <InfoItem label="Water Source" value={land.land_water_source} icon={<BoxIcon className="size-4" />} />
                                                </div>
                                                <div className="space-y-3 min-w-0">
                                                    <InfoItem label="Ownership" value={land.owner_ship_type} icon={<UserIcon className="size-4" />} />
                                                    <InfoItem label="Coordinates" value={land.land_coordinates} icon={<GridIcon className="size-4" />} />
                                                </div>
                                                <div className="space-y-3 min-w-0">
                                                    <InfoItem label="Passbook No" value={land.passbookNo} icon={<FileIcon className="size-4" />} />
                                                    <InfoItem label="ROR No" value={land.rorNo} icon={<FileIcon className="size-4" />} />
                                                    <InfoItem label="Aadhar Name" value={land.owner_aadharName} icon={<UserIcon className="size-4" />} />
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-dashed border-gray-200 dark:border-gray-700">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Land Documents & Clearances</p>
                                                <div className="flex flex-wrap gap-4">
                                                    {[
                                                        { label: "Passbook", url: land.passbook_url },
                                                        { label: "LPM", url: land.lpm_url },
                                                        { label: "Adangal", url: land.adangal_url },
                                                        { label: "ROR Copy", url: land.ror_url },
                                                        { label: "Aadhar", url: land.owner_aadhar_url },
                                                        { label: "NOC", url: land.noc_url },
                                                        { label: "Encumbrance", url: land.emcumbrance_url },
                                                        { label: "APC", url: land.apc_url }
                                                    ].filter(doc => doc.url).map((doc, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setPreviewImage({ url: doc.url!, title: `${doc.label} - Survey #${land.survey_no}` })}
                                                            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-400 transition-all text-gray-600 dark:text-gray-400 hover:text-primary-600 shadow-sm"
                                                        >
                                                            <FileIcon className="size-4" />
                                                            <span className="text-xs font-bold uppercase tracking-wider">{doc.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {land.land_images_url && Array.isArray(land.land_images_url) && land.land_images_url.length > 0 && (
                                                <div className="mt-6 pt-6 border-t border-dashed border-gray-200 dark:border-gray-700">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Site Images</p>
                                                    <div className="flex flex-wrap gap-3">
                                                        {land.land_images_url.map((img: string, i: number) => (
                                                            <div
                                                                key={i}
                                                                onClick={() => setPreviewImage({ url: img, title: `Land Image ${i + 1} - Survey #${land.survey_no}` })}
                                                                className="size-20 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer hover:scale-105 transition-transform"
                                                            >
                                                                <img src={img} className="w-full h-full object-cover" alt="" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </DetailCard>
                        </div>
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
