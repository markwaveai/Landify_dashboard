import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getLandDetails, approveLandStage1, approveLandStage2 } from "../../services/landService";
import { getFarmerFullDetails } from "../../services/userService";
import PageMeta from "../../components/common/PageMeta";
import {
    AngleLeftIcon,
    UserIcon,
    GridIcon,
    FileIcon,
    TableIcon,
    CheckCircleIcon,
    CloseIcon
} from "../../icons";
import Badge from "../../components/ui/badge/Badge";
import DetailCard from "../../components/common/DetailCard";
import InfoItem from "../../components/common/InfoItem";
import { ImagePreviewModal } from "../../components/ui/modal/ImagePreviewModal";
import { useParams, useNavigate, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useSnackbar } from "../../context/SnackbarContext";

const LandApprovalDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [previewImage, setPreviewImage] = React.useState<{ url: string; title: string } | null>(null);
    const { user } = useSelector((state: RootState) => state.auth);
    const { showSnackbar } = useSnackbar();
    const [actionLoading, setActionLoading] = React.useState<string | null>(null);
    const [actionRemarks, setActionRemarks] = React.useState("");

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
            return getFarmerFullDetails(String(land.user_id));
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

    const landImages = Array.isArray(land.land_images_url)
        ? land.land_images_url
        : (Array.isArray(land.land_urls) ? land.land_urls : (land.land_images_url || land.land_image_url ? [land.land_images_url || land.land_image_url] : []));

    const landPhotos = landImages.filter(Boolean).map((url: any, i: number) => ({
        url: String(url),
        label: `Land Photo ${i + 1}`,
        icon: <FileIcon className="size-4" />
    })).filter((doc: any) => typeof doc.url === 'string' && doc.url.startsWith('http'));

    const legalDocuments = [
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

    const farmerDocuments = [
        { url: owner?.user_image_url, label: "User Photo", icon: <UserIcon className="size-4" /> },
        { url: owner?.aadhar_image_url, label: "Aadhar Front", icon: <UserIcon className="size-4" /> },
        { url: owner?.aadhar_back_image_url, label: "Aadhar Back", icon: <UserIcon className="size-4" /> },
        { url: owner?.pan_image_url, label: "PAN Card", icon: <FileIcon className="size-4" /> },
        { url: owner?.bank_passbook_image_url, label: "Bank Passbook", icon: <FileIcon className="size-4" /> },
        { url: owner?.agreement_url, label: "Agreement", icon: <FileIcon className="size-4" /> },
    ];

    const ownerNameStr = owner
        ? `${owner.surname || ''} ${owner.first_name || ''}`.trim()
        : (land.owner_first_name
            ? `${land.surname || ''} ${land.owner_first_name}`.trim()
            : (land.land_holder_name || land.land_holder_aadharName || land.owner_aadharName || land.owner_name || "-"));

    const coords = Array.isArray(land?.land_coordinates) ? land.land_coordinates : [];
    const formatCoord = (lat: any, lng: any) => {
        const la = parseFloat(String(lat));
        const ln = parseFloat(String(lng));
        return !isNaN(la) && !isNaN(ln) ? `${la.toFixed(6)}, ${ln.toFixed(6)}` : "-";
    };

    const tf_latlng = formatCoord(coords[0], coords[1]);
    const bl_latlng = formatCoord(coords[2], coords[3]);
    const br_latlng = formatCoord(coords[4], coords[5]);
    const tr_latlng = formatCoord(coords[6], coords[7]);

    const handleAction = async (action: "APPROVE" | "REJECT") => {
        if (!id || !user?.role) return;
        if (action === "REJECT" && !actionRemarks.trim()) {
            showSnackbar("Please provide a reason for rejection in remarks", "error");
            return;
        }

        try {
            setActionLoading(action);
            const data = { action, reason: actionRemarks };
            if (user.role === "ADMIN") {
                await approveLandStage2(id, data);
            } else if (user.role === "FIELD_OFFICER") {
                await approveLandStage1(id, data);
            }
            showSnackbar(`Land accurately ${action === "APPROVE" ? "Approved" : "Rejected"} Successful!`, "success");
            setActionRemarks("");
            navigate(0);
        } catch (error: any) {
            console.error("Land action failed:", error);
            showSnackbar(error.response?.data?.message || `Failed to ${action.toLowerCase()} land`, "error");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6 pb-20 max-w-[1400px] mx-auto px-4 sm:px-6">
            <PageMeta title={`Land Details - #${land.landId || land.id || id}`} description="View comprehensive land approval data" />

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 hover:border-brand-200 transition-all text-gray-600"
                    >
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

                <div className="flex flex-wrap items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Application Status</p>
                        <Badge variant="solid" color={String(land.status || '').includes('PENDING') ? 'warning' : (String(land.status || '').includes('APPROVED') || land.status === 'LAND_ACTIVATED') ? 'success' : 'error'}>
                            {String(land.status || '-')}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 space-y-6">
                    <DetailCard title="Farmer Information">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-primary-50/50 dark:bg-primary-500/5 rounded-2xl border border-primary-100 dark:border-primary-800">
                                <div className="h-14 w-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-primary-600 shadow-sm border border-gray-100 dark:border-gray-700">
                                    {owner?.user_image_url ? (
                                        <img src={owner.user_image_url} alt={ownerNameStr} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="size-8 opacity-40" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-800 dark:text-white truncate">{ownerNameStr}</h3>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="light" size="sm" color="info">
                                            {String(owner?.role || "FARMER").replace(/_/g, ' ')}
                                        </Badge>
                                        <span className="text-[10px] text-gray-400 font-bold">• ID: {land.user_id}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 leading-tight">Total Lands</p>
                                    <p className="text-lg font-bold text-gray-800 dark:text-white leading-none">{owner?.total_lands || 0}</p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 leading-tight">Total Acres</p>
                                    <p className="text-lg font-bold text-gray-800 dark:text-white leading-none">{owner?.total_acres || 0}</p>
                                </div>
                            </div>

                            {/* Detailed Land Stats */}
                            {owner?.land_stats && (
                                <div className="grid grid-cols-3 gap-2 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                    {[
                                        { label: "Approved", value: owner.land_stats.approved_lands, color: "text-green-500" },
                                        { label: "Active", value: owner.land_stats.active_lands, color: "text-blue-500" },
                                        { label: "Harvest Ready", value: owner.land_stats.harvest_ready, color: "text-orange-500" },
                                        { label: "In Review", value: owner.land_stats.review_lands, color: "text-yellow-500" },
                                        { label: "Remarks", value: owner.land_stats.remarks_lands, color: "text-gray-500" },
                                        { label: "Rejected", value: owner.land_stats.rejected_lands, color: "text-red-500" },
                                    ].map((stat, idx) => (
                                        <div key={idx} className="text-center">
                                            <p className={`text-[11px] font-bold ${stat.color}`}>{stat.value || 0}</p>
                                            <p className="text-[8px] text-gray-400 font-bold uppercase truncate px-1">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                <InfoItem label="Phone Number" value={owner?.phone_number || "-"} icon={<UserIcon className="size-4" />} />
                                <InfoItem label="Reference ID" value={owner?.reference_id || "-"} icon={<UserIcon className="size-4" />} />
                                <InfoItem label="Alternate Phone" value={owner?.alternate_phone_number || "-"} icon={<UserIcon className="size-4" />} />
                                <InfoItem label="DOB" value={owner?.date_of_birth || owner?.dob || land.land_holder_dob || "-"} icon={<UserIcon className="size-4" />} />
                                <InfoItem label="Aadhar Number" value={owner?.aadhar_card_number || land.owner_aadhar_number || "-"} icon={<UserIcon className="size-4" />} />
                                <InfoItem label="Pan Number" value={owner?.pan_number || "-"} icon={<FileIcon className="size-4" />} />
                                <InfoItem label="Village" value={owner?.village || "-"} icon={<GridIcon className="size-4" />} />
                                <InfoItem label="Mandal" value={owner?.mandal || "-"} icon={<GridIcon className="size-4" />} />

                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Banking Details</p>
                                    <div className="space-y-2">
                                        <InfoItem label="Account Number" value={owner?.account_number || "-"} icon={<FileIcon className="size-4" />} />
                                        <InfoItem label="Bank Name" value={owner?.bank_name || "-"} icon={<FileIcon className="size-4" />} />
                                        <InfoItem label="IFSC Code" value={owner?.ifsc_code || "-"} icon={<FileIcon className="size-4" />} />
                                        <InfoItem label="Branch Name" value={owner?.bank_branch || "-"} icon={<FileIcon className="size-4" />} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DetailCard>



                    {String(land.owner_ship_type || '').toUpperCase() === 'LEASE' && (
                        <DetailCard title="Owner Information (Lease)">
                            <div className="space-y-4">
                                <InfoItem label="Land Holder Name" value={land.land_holder_name || land.owner_aadharName || "Not Provided"} icon={<UserIcon className="size-4" />} />
                                <InfoItem label="Owner Aadhar Name" value={land.owner_aadharName || "Not Provided"} icon={<UserIcon className="size-4" />} />
                                <InfoItem label="Land Holder DOB" value={land.land_holder_dob || "Not Provided"} icon={<UserIcon className="size-4" />} />
                                <InfoItem label="Passbook Number" value={land.passbookNo || land.passbook_no || "Not Provided"} icon={<FileIcon className="size-4" />} />
                                <InfoItem label="Ownership Type" value={land.owner_ship_type || "Not Provided"} icon={<GridIcon className="size-4" />} />

                                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Owner Address</p>
                                    <div className="space-y-2">
                                        <InfoItem label="State" value={land.land_address?.state || "Not Provided"} icon={<GridIcon className="size-3.5 opacity-50" />} />
                                        <InfoItem label="District" value={land.land_address?.district || "Not Provided"} icon={<GridIcon className="size-3.5 opacity-50" />} />
                                        <InfoItem label="Mandal" value={land.land_address?.mandal || "Not Provided"} icon={<GridIcon className="size-3.5 opacity-50" />} />
                                        <InfoItem label="Village" value={land.land_address?.village || "Not Provided"} icon={<GridIcon className="size-3.5 opacity-50" />} />
                                    </div>
                                </div>


                            </div>
                        </DetailCard>
                    )}
                </div>

                <div className="lg:col-span-8 space-y-6">
                    <DetailCard title="Land Specification">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl text-center border border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Acres</p>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">{land.acres ?? "-"}</p>
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-mono"><span className="text-gray-400">Top Left:</span> {tf_latlng}</div>
                                    <div className="flex justify-between text-[10px] font-mono"><span className="text-gray-400">Top Right:</span> {tr_latlng}</div>
                                </div>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-mono"><span className="text-gray-400">Bottom Left:</span> {bl_latlng}</div>
                                    <div className="flex justify-between text-[10px] font-mono"><span className="text-gray-400">Bottom Right:</span> {br_latlng}</div>
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
                                        {land.remarks || land.remarks_stage1 || land.remarks_stage2 || "-"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </DetailCard>

                    <DetailCard title="Farmer Verification Proofs">
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
                            {farmerDocuments.map((doc, idx) => {
                                const hasUrl = typeof doc.url === 'string' && doc.url.startsWith('http');
                                return (
                                    <div key={idx} onClick={() => hasUrl && setPreviewImage({ url: doc.url as string, title: doc.label })} className={`group ${hasUrl ? 'cursor-pointer' : 'cursor-default'}`}>
                                        <div className={`aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border transition-all ${hasUrl
                                            ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 group-hover:ring-2 group-hover:ring-primary-500'
                                            : 'bg-gray-50/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800 border-dashed'
                                            }`}>
                                            {hasUrl ? (
                                                <img src={doc.url as string} alt={doc.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-40">
                                                    {doc.icon}
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-center px-2">Not Uploaded</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className={`mt-2 text-[10px] text-center font-bold uppercase tracking-tighter truncate ${hasUrl ? 'text-gray-500 group-hover:text-primary-600' : 'text-gray-300'}`}>{doc.label}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </DetailCard>

                    <DetailCard title="Legal Documentation">
                        {legalDocuments.length === 0 ? (
                            <div className="py-10 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                <FileIcon className="size-10 mx-auto text-gray-300 mb-2" />
                                <p className="text-sm text-gray-500 italic">No legal documents found for this record.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {legalDocuments.map((doc: any, idx: number) => (
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

                    <DetailCard title="Land Photos">
                        {landPhotos.length === 0 ? (
                            <div className="py-10 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                <FileIcon className="size-10 mx-auto text-gray-300 mb-2" />
                                <p className="text-sm text-gray-500 italic">No land photos uploaded.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {landPhotos.map((doc: any, idx: number) => (
                                    <div key={idx} onClick={() => setPreviewImage({ url: doc.url, title: doc.label })} className="group cursor-pointer">
                                        <div className="aspect-[4/3] rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700 group-hover:ring-2 group-hover:ring-primary-500 transition-all shadow-sm">
                                            <img src={doc.url} alt={doc.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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

            {/* Role Based Review Actions - Bottom Sticky */}
            {(user?.role === "ADMIN" || user?.role === "FIELD_OFFICER") && land.status && land.status.includes('PENDING') && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col sm:flex-row items-center gap-2">
                        <input
                            type="text"
                            placeholder="Add final review remarks..."
                            value={actionRemarks}
                            onChange={(e) => setActionRemarks(e.target.value)}
                            className="px-4 py-3 text-sm bg-transparent border-none focus:ring-0 flex-1 placeholder:text-gray-400 font-medium dark:text-white"
                        />
                        <div className="flex items-center gap-2 p-1 pr-2 w-full sm:w-auto">
                            <button
                                disabled={!!actionLoading || !actionRemarks.trim()}
                                onClick={() => handleAction("REJECT")}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${actionLoading === "REJECT"
                                    ? "bg-red-100 text-red-400 cursor-not-allowed"
                                    : !actionRemarks.trim()
                                        ? "bg-gray-50 dark:bg-gray-800/50 text-gray-300 dark:text-gray-600 cursor-not-allowed border border-gray-100 dark:border-gray-800"
                                        : "bg-white dark:bg-gray-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-100 dark:border-red-500/20"
                                    }`}
                            >
                                {actionLoading === "REJECT" ? (
                                    <div className="size-3.5 border-2 border-red-400 border-t-transparent animate-spin rounded-full"></div>
                                ) : <CloseIcon className="size-4" />}
                                REJECT
                            </button>
                            <button
                                disabled={!!actionLoading}
                                onClick={() => handleAction("APPROVE")}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${actionLoading === "APPROVE"
                                    ? "bg-green-100 text-green-400 cursor-not-allowed"
                                    : "bg-white dark:bg-gray-800 text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 border border-green-100 dark:border-green-500/20 shadow-green-500/5"
                                    }`}
                            >
                                {actionLoading === "APPROVE" ? (
                                    <div className="size-3.5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                                ) : <CheckCircleIcon className="size-4" />}
                                APPROVE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandApprovalDetailsPage;
