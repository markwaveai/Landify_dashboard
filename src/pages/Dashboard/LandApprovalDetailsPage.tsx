import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getLandDetails } from "../../services/landService";
import { fetchProfile } from "../../services/authService";
import api from "../../services/api";
import PageMeta from "../../components/common/PageMeta";
import {
    AngleLeftIcon,
    UserIcon,
    GridIcon,
    FileIcon,
    TableIcon
} from "../../icons";
import Badge from "../../components/ui/badge/Badge";
import DetailCard from "../../components/common/DetailCard";
import InfoItem from "../../components/common/InfoItem";
import { ImagePreviewModal } from "../../components/ui/modal/ImagePreviewModal";
import { useParams, useNavigate, useLocation } from "react-router";

const LandApprovalDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [previewImage, setPreviewImage] = React.useState<{ url: string; title: string } | null>(null);

    const initialLandData = location.state?.land;

    const { data: land, isLoading: isLandLoading, isError: isLandError } = useQuery({
        queryKey: ["land-details", id],
        queryFn: () => getLandDetails(id!),
        enabled: !!id,
        initialData: initialLandData && (
            String(initialLandData.id || "") === String(id || "") ||
            String(initialLandData.id || "").replace(/^\D+/, '') === String(id || "").replace(/^\D+/, '')
        ) ? initialLandData : undefined
    });

    const { data: owner } = useQuery({
        queryKey: ["user-profile", land?.user_id],
        queryFn: async () => {
            if (!land?.user_id) return null;
            // If it's a numeric phone number
            if (/^\d+$/.test(String(land.user_id))) {
                return fetchProfile(String(land.user_id));
            }
            // If it's a unique ID (like FR100...)
            try {
                const response = await api.get(`/users/${land.user_id}`);
                // Use the same mapping as fetchProfile or mapUser
                const u = response.data;
                if (!u) return null;
                return {
                    ...u,
                    first_name: u.name?.split(' ')[0] || u.name || u.first_name || "",
                    last_name: u.name?.split(' ').slice(1).join(' ') || u.last_name || "",
                    phone_number: u.phoneNumber || u.phone_number || "",
                    unique_id: u.userId || u.unique_id,
                    role: u.role || u.type || "FARMER"
                };
            } catch (e) {
                return null;
            }
        },
        enabled: !!land?.user_id,
    });

    if (isLandLoading && !land) {
        return (
            <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                <p className="text-gray-500 animate-pulse font-medium">Loading details...</p>
            </div>
        );
    }

    if (!land || isLandError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
                <div className="mb-4 p-4 bg-red-50 rounded-full text-red-500">
                    <TableIcon className="size-10" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Record Not Found</h2>
                <p className="text-gray-500 mt-2">Cannot find land data for ID: {id}</p>
                <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-xl font-bold">
                    Back to List
                </button>
            </div>
        );
    }

    const documents = [
        ...(Array.isArray(land.land_urls)
            ? land.land_urls.filter(Boolean).map((url: string, i: number) => ({
                url: String(url), label: `Land Photo ${i + 1}`, icon: <FileIcon className="size-4" />
            }))
            : (land.land_image_url || land.land_images_url ? [{ url: String(land.land_image_url || land.land_images_url), label: "Land Photo", icon: <FileIcon className="size-4" /> }] : [])
        ),
        { url: land.passbook_url || land.passbook_image_url, label: "Passbook", icon: <FileIcon className="size-4" /> },
        { url: land.emcumbrance_url || land.ec_certificate_url, label: "EC Certificate", icon: <FileIcon className="size-4" /> },
        { url: land.ror_url || land.ror_1b_url || land.ror1b || land.roe_url, label: "ROR / 1-B", icon: <FileIcon className="size-4" /> },
        { url: land.adangal_url, label: "Adangal", icon: <FileIcon className="size-4" /> },
        { url: land.owner_aadhar_url || land.farmer_aadhar_front || land.aadhar_front, label: "Aadhar", icon: <UserIcon className="size-4" /> },
        { url: land.noc_url || land.owner_noc_image_url || land.noc_image_url, label: "NOC", icon: <FileIcon className="size-4" /> },
        { url: land.apc_url || land.apc_image_url, label: "APC Proof", icon: <FileIcon className="size-4" /> },
        { url: land.lpm_url, label: "LPM", icon: <FileIcon className="size-4" /> },
        { url: land.user_image_url, label: "User Photo", icon: <UserIcon className="size-4" /> },
    ].filter(doc => doc && typeof doc.url === 'string' && doc.url.startsWith('http'));

    const ownerNameStr = owner
        ? `${owner.surname || ''} ${owner.first_name || ''}`.trim()
        : (land.owner_first_name
            ? `${land.surname || ''} ${land.owner_first_name}`.trim()
            : (land.land_holder_name || land.land_holder_aadharName || land.owner_aadharName || land.owner_name || "-"));

    return (
        <div className="space-y-6 pb-20 max-w-[1400px] mx-auto px-4 sm:px-6">
            <PageMeta title={`Land Details - #${land.landId || land.id || id}`} description="View comprehensive land approval data" />

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl border border-gray-200 bg-white dark:bg-white/[0.03] shadow-sm hover:bg-gray-50 transition-colors">
                        <AngleLeftIcon className="size-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Land Detail View</h1>
                            <Badge variant="solid" color={land.land_status === 'ACTIVE' || land.land_status === 'ADMIN_APPROVED' ? 'success' : land.land_status === 'FO_APPROVED' ? 'warning' : 'light'}>
                                {String(land.land_status || 'INACTIVE')}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">#{land.landId || land.id || id} • Holder: {ownerNameStr}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Application Status</p>
                        <Badge variant="solid" color={String(land.status || '').includes('PENDING') ? 'warning' : String(land.status || '').includes('APPROVED') ? 'success' : 'error'}>
                            {String(land.status || '-')}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Summary & Owner */}
                <div className="lg:col-span-4 space-y-6">
                    <DetailCard title="Owner Information">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-primary-50/50 dark:bg-primary-500/5 rounded-2xl border border-primary-100 dark:border-primary-800">
                                <div className="h-12 w-12 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/20">
                                    {(ownerNameStr === "-" ? (String(land.user_id || "U")) : ownerNameStr).charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 dark:text-white truncate max-w-[200px]">{ownerNameStr}</h3>
                                    <p className="text-xs text-gray-500 font-medium">{land.owner_ship_type || land.ownership_details || "Private Owner"}</p>
                                </div>
                            </div>
                            <InfoItem label="User ID" value={land.user_id || land.userId} icon={<UserIcon className="size-4" />} />
                            <InfoItem label="Relation" value={land.relation || land.relation_type} icon={<UserIcon className="size-4" />} />
                            <InfoItem label="DOB" value={land.land_holder_dob || land.owner_dob || "-"} icon={<UserIcon className="size-4" />} />
                            <InfoItem label="Aadhar Name" value={land.land_holder_aadharName || land.owner_aadharName || "-"} icon={<UserIcon className="size-4" />} />
                        </div>
                    </DetailCard>

                    <DetailCard title="Agent Information">
                        <div className="space-y-3">
                            <InfoItem label="Assigned Agent" value={land.agent_name || land.added_by_name || "-"} icon={<UserIcon className="size-4" />} />
                            <InfoItem label="Agent Contact" value={land.agent_contact || land.agent_phone || land.added_by_phone || "-"} icon={<UserIcon className="size-4" />} />
                        </div>
                    </DetailCard>

                    <DetailCard title="Location Details">
                        <div className="space-y-3">
                            <InfoItem label="State" value={land.state || "-"} icon={<GridIcon className="size-4" />} />
                            <InfoItem label="District" value={land.district || "-"} icon={<GridIcon className="size-4" />} />
                            <InfoItem label="Mandal" value={land.mandal || "-"} icon={<GridIcon className="size-4" />} />
                            <InfoItem label="Village" value={land.village || "-"} icon={<GridIcon className="size-4" />} />
                            {land.division && <InfoItem label="Division" value={land.division} icon={<GridIcon className="size-4" />} />}
                        </div>
                    </DetailCard>
                </div>

                {/* Right Column: Physical & Documents */}
                <div className="lg:col-span-8 space-y-6">
                    <DetailCard title="Land Specification">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl text-center border border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Acres</p>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">{land.acres ?? "-"}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl text-center border border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Guntas</p>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">{land.gunta ?? land.guntas ?? "-"}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl text-center border border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Sents</p>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">{land.sents ?? land.cents ?? "-"}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl text-center border border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Survey No</p>
                                <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{land.survey_no || land.survey_number || "-"}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                            <InfoItem label="Water Source" value={land.water_source || land.land_water_source || "-"} icon={<GridIcon className="size-4" />} />
                            <InfoItem label="Land Type" value={(land.land_type || land.type)?.replace(/_/g, ' ') || "-"} icon={<GridIcon className="size-4" />} />
                            <InfoItem label="Passbook No" value={land.passbookNo || land.passbook_no || "-"} icon={<FileIcon className="size-4" />} />
                            <InfoItem label="ROR Number" value={land.rorNo || land.ror_no || "-"} icon={<FileIcon className="size-4" />} />
                        </div>
                    </DetailCard>

                    <DetailCard title="Geospatial Coordinates">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">North-East Points</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-mono"><span className="text-gray-400">Top Left:</span> {land.tf_latlng || "-"}</div>
                                    <div className="flex justify-between text-xs font-mono"><span className="text-gray-400">Top Right:</span> {land.tr_latlng || "-"}</div>
                                </div>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">South-West Points</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-mono"><span className="text-gray-400">Bottom Left:</span> {land.bl_latlng || "-"}</div>
                                    <div className="flex justify-between text-xs font-mono"><span className="text-gray-400">Bottom Right:</span> {land.br_latlng || "-"}</div>
                                </div>
                            </div>
                        </div>
                    </DetailCard>

                    <DetailCard title="Remarks & History">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 p-1.5 rounded-full bg-primary-100 text-primary-600">
                                    <FileIcon className="size-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Approval Remarks</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 italic font-medium">
                                        "{land.remarks || land.remarks_stage1 || land.remarks_stage2 || "No remarks provided yet."}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </DetailCard>

                    <DetailCard title="Verification Proofs">
                        {documents.length === 0 ? (
                            <div className="py-10 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                <FileIcon className="size-10 mx-auto text-gray-300 mb-2" />
                                <p className="text-sm text-gray-500 italic">No verification documents found for this record.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {documents.map((doc, idx) => (
                                    <div key={idx} onClick={() => setPreviewImage({ url: doc.url, title: doc.label })} className="group cursor-pointer">
                                        <div className="aspect-[4/3] rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700 group-hover:ring-2 group-hover:ring-primary-500 transition-all shadow-sm">
                                            {(doc.url.toLowerCase().endsWith('.pdf') || doc.url.toLowerCase().includes('pdf')) ? (
                                                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                                    <FileIcon className="size-10 text-red-500" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">PDF Document</span>
                                                </div>
                                            ) : <img src={doc.url} alt={doc.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
                                        </div>
                                        <p className="mt-2 text-[10px] text-center font-bold text-gray-500 group-hover:text-primary-600 uppercase tracking-tighter truncate">{doc.label}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </DetailCard>
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

export default LandApprovalDetailsPage;
