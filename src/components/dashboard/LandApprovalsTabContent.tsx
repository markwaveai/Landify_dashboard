import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { getLands, approveLandStage1, approveLandStage2, updateLand } from '../../services/landService';
import { CheckCircleIcon, FileIcon, UserIcon } from '../../icons';
import { RootState } from '../../store/store';
import { useSnackbar } from "../../context/SnackbarContext";

interface LandApprovalsTabContentProps {
    isAdminView?: boolean;
    lands?: any[];
    isLoading?: boolean;
}

export default function LandApprovalsTabContent(props: LandApprovalsTabContentProps) {
    const { isAdminView = false, lands: initialLands, isLoading: initialLoading } = props;
    const isControlled = 'lands' in props;
    const queryClient = useQueryClient();
    const { user } = useSelector((state: RootState) => state.auth);
    const [activeSubTab, setActiveSubTab] = useState<'pending' | 'admin_pending' | 'approved' | 'active_land' | 'rejected'>(isAdminView ? 'admin_pending' : 'pending');
    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();

    // Dynamically fetch lands based on tab and view
    const { data: allLandsFromQuery, isLoading: queryLoading } = useQuery({
        queryKey: ['lands'],
        queryFn: getLands,
        enabled: !isControlled,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const allLands = initialLands || allLandsFromQuery;
    const isLoading = initialLands ? initialLoading : queryLoading;

    const lands = useMemo(() => {
        if (!allLands) return [];
        return allLands.filter((l: any) => {
            const status = l.status || '';
            const statusUpper = status.toUpperCase();

            if (isAdminView) {
                // Admin View Logic
                const isApprovedStatus = status === 'ADMIN_APPROVED' || status === 'LAND_ACTIVATED';
                const isActive = l.land_status === 'ACTIVE' || String(l.land_status).toUpperCase() === 'ACTIVE';

                if (activeSubTab === 'pending') return status === 'FO_APPROVED'; // Ready for Admin Review
                if (activeSubTab === 'admin_pending') return status === 'ADMIN_PENDING';
                if (activeSubTab === 'approved') return isApprovedStatus && !isActive; // Only non-active approved
                if (activeSubTab === 'active_land') return isApprovedStatus && isActive; // Only active approved
                if (activeSubTab === 'rejected') return status === 'ADMIN_REJECTED';
            } else {
                // FO / Agent View Logic
                if (activeSubTab === 'pending') return (statusUpper.includes('PENDING') || status === 'SUBMITTED') && statusUpper !== 'ADMIN_PENDING';
                if (activeSubTab === 'approved') return status === 'FO_APPROVED';
                if (activeSubTab === 'rejected') return status === 'FO_REJECTED'; // Keeping it consistent if rejected follows similar logic
            }
            return false;
        });
    }, [allLands, isAdminView, activeSubTab]);

    // Check if user has permission to approve/reject
    // Actions only valid in 'pending' tabs for respective roles
    const canApprove = (
        (activeSubTab === 'pending' || activeSubTab === 'admin_pending') && (
            (isAdminView && user?.role === 'ADMIN') ||
            (!isAdminView && user?.role === 'FIELD_OFFICER' && activeSubTab === 'pending')
        )
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLand, setSelectedLand] = useState<{ id: string, land: any, action: 'APPROVE' | 'REJECT' } | null>(null);
    const [remarks, setRemarks] = useState("");
    const [remarkingLandId, setRemarkingLandId] = useState<string | null>(null);
    const [tempRemarks, setTempRemarks] = useState("");

    const handleActionClick = (land: any, action: 'APPROVE' | 'REJECT') => {
        setSelectedLand({ id: land.id, land, action });
        setRemarks("");
        setIsModalOpen(true);
    };

    const handleConfirmAction = async () => {
        if (!selectedLand) return;
        const { id, action } = selectedLand;
        const actionLabel = action === 'APPROVE' ? 'Approve' : 'Reject';

        if (action === 'REJECT' && !remarks.trim()) {
            showSnackbar("Remarks are required for rejection", "error");
            return;
        }

        try {
            if (isAdminView) {
                await approveLandStage2(id, { action, reason: remarks });
            } else {
                await approveLandStage1(id, { action, reason: remarks });
            }
            showSnackbar(`Land ${actionLabel}ed Successfully`, 'success');
            setIsModalOpen(false);
            setSelectedLand(null);
            queryClient.invalidateQueries({ queryKey: ['lands'] });
        } catch (error: any) {
            console.error(error);
            showSnackbar(error.response?.data?.message || "Failed to process request", 'error');
        }
    };

    const handleRowClick = (land: any) => {
        navigate(`/land-approvals/${land.id}`, { state: { land } });
    };

    const handleRemarkSubmit = async (land: any) => {
        if (!tempRemarks.trim()) {
            showSnackbar("Please enter some remarks", "error");
            return;
        }

        try {
            await updateLand(land.id, { remarks: tempRemarks });
            showSnackbar("Remarks updated successfully", "success");
            setRemarkingLandId(null);
            setTempRemarks("");
            queryClient.invalidateQueries({ queryKey: ['lands'] });
        } catch (error: any) {
            showSnackbar("Failed to update remarks", "error");
        }
    };

    const formatValue = (val: any) => (val === undefined || val === null || val === "" ? "-" : val);

    // const IconLink = ({ url, label }: { url?: string; label: string }) => {
    //     if (!url || url === "-") return <div className="flex items-center gap-1 text-gray-400 truncate"><span className="text-[10px]">{label}:</span> -</div>;
    //     return (
    //         <a
    //             href={url}
    //             target="_blank"
    //             rel="noopener noreferrer"
    //             className="flex items-center gap-1 text-green-600 hover:text-green-700 dark:text-green-400 hover:underline truncate"
    //             onClick={(e) => e.stopPropagation()}
    //         >
    //             <FileIcon className="size-3 flex-shrink-0" />
    //             <span className="text-[10px] font-bold">{label}</span>
    //         </a>
    //     );
    // };

    // Dynamic columns logic
    const columns = useMemo(() => {
        if (!lands || lands.length === 0) return [];

        return [
            {
                id: 'sno',
                header: 'S.NO',
                minWidth: '60px',
                align: 'center',
                render: (_: any, idx: number) => (
                    <div className="flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                            {idx + 1}
                        </span>
                    </div>
                )
            },
            {
                id: 'owner',
                header: 'OWNER',
                minWidth: '180px',
                align: 'center',
                render: (land: any) => (
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm relative transition-colors flex items-center justify-center">
                            {land.user_image_url ? (
                                <img
                                    src={land.user_image_url}
                                    alt="owner"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <UserIcon className="size-5 text-gray-400 dark:text-gray-500" />
                            )}
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[120px]">
                                {land.land_holder_name || land.owner_name || ""}
                            </span>
                            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                                {formatValue(land.user_id || land.userId)}
                            </span>
                        </div>
                    </div>
                )
            },
            {
                id: 'land_id',
                header: 'LAND ID',
                align: 'center',
                render: (land: any) => (
                    <div className="flex items-center justify-center">
                        <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">
                            #{formatValue(land.landId || land.id)}
                        </span>
                    </div>
                )
            },
            /* {
                id: 'land_details',
                header: 'LAND DETAILS',
                render: (land: any) => (
                    <div className="text-[11px] space-y-0.5 min-w-[220px] py-1">
                        <div className="flex justify-between gap-2">
                            <span className="text-gray-400 dark:text-gray-400">DOB:</span>
                            <span className="text-gray-600 dark:text-gray-200">{formatValue(land.land_holder_dob)}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-gray-400 dark:text-gray-400">Survey:</span>
                            <span className="text-gray-600 dark:text-gray-200 font-bold">{formatValue(land.survey_number || land.survey_no)}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-gray-400 dark:text-gray-400">Area:</span>
                            <span className="text-gray-600 dark:text-gray-200 font-medium">{land.acres || 0} Ac {land.gunta || 0} Gts {land.sents || 0} Snts</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-gray-400 dark:text-gray-400">Type:</span>
                            <span className="text-gray-600 dark:text-gray-200 capitalize">{formatValue(land.land_type?.replace(/_/g, ' '))}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-gray-400 dark:text-gray-400">Water:</span>
                            <span className="text-gray-600 dark:text-gray-200">{formatValue(land.land_water_source || land.water_source)}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-gray-400 dark:text-gray-400">Ownership:</span>
                            <span className="text-gray-600 dark:text-gray-200 italic">{formatValue(land.owner_ship_type || land.ownership_details)}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-gray-400 dark:text-gray-400">Passbook No:</span>
                            <span className="text-gray-600 dark:text-gray-200">{formatValue(land.passbookNo)}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-gray-400 dark:text-gray-400">Aadhar Name:</span>
                            <span className="text-gray-600 dark:text-gray-200">{formatValue(land.owner_aadharName)}</span>
                        </div>
                    </div>
                )
            }, */
            {
                id: 'land_address',
                header: 'LAND ADDRESS',
                align: 'center',
                render: (land: any) => (
                    <div className="text-[10px] space-y-0.5 min-w-[160px] text-center">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-lg border border-gray-100 dark:border-gray-700/50">
                            <p className="font-bold text-gray-800 dark:text-white truncate" title={land.village || land.land_address?.village}>
                                {formatValue(land.village || land.land_address?.village)}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 truncate" title={`${land.mandal || land.land_address?.mandal}, ${land.district || land.land_address?.district}`}>
                                {formatValue(land.mandal || land.land_address?.mandal)}, {formatValue(land.district || land.land_address?.district)}
                            </p>
                        </div>
                    </div>
                )
            },
            /* {
                 id: 'verification',
                 header: 'VERIFICATION',
                 render: (land: any) => (
                     <div className="min-w-[200px] p-1.5 bg-gray-50/50 dark:bg-white/[0.02] rounded-lg">
                         <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                             <IconLink url={land.user_image_url} label="User" />
                             <IconLink url={land.land_image_url} label="Land" />
                             <IconLink url={land.owner_aadhar_url} label="Aadhar" />
                             <IconLink url={land.emcumbrance_url} label="EC" />
                             <IconLink url={land.passbook_url} label="Passbook" />
                             <IconLink url={land.lpm_url} label="LPM" />
                             <IconLink url={land.adangal_url} label="Adangal" />
                             <IconLink url={land.ror_url} label="ROR" />
                             <IconLink url={land.noc_url} label="NOC" />
                             <IconLink url={land.apc_url} label="APC" />
                             <div className="col-span-2 mt-1 pt-1 border-t border-gray-200/50 dark:border-gray-700/50 text-[10px] flex justify-between">
                                 <span className="text-gray-400 dark:text-gray-400">ROR No:</span>
                                 <span className="text-gray-600 dark:text-gray-300 font-bold">{formatValue(land.rorNo)}</span>
                             </div>
                         </div>
                     </div>
                 )
             },*/
            {
                id: 'status',
                header: 'STATUS',
                align: 'center',
                render: (land: any) => {
                    const statusStr = (land.status || '');
                    const isRejected = statusStr.includes('REJECTED');
                    const isApproved = statusStr === 'ADMIN_APPROVED' || statusStr === 'FO_APPROVED';
                    let badgeClass = 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800/50';
                    let dotClass = 'bg-gray-500';

                    if (isRejected) {
                        dotClass = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]';
                        badgeClass = 'text-red-600 dark:text-red-400';
                    } else if (isApproved) {
                        dotClass = 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]';
                        badgeClass = 'text-green-600 dark:text-green-400';
                    } else if (statusStr.includes('PENDING')) {
                        dotClass = 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]';
                        badgeClass = 'text-amber-600 dark:text-amber-400';
                    }

                    return (
                        <div className="flex justify-center">
                            <div className="inline-flex items-center gap-1.5">
                                <div className={`size-1.5 rounded-full ${dotClass}`}></div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${badgeClass}`}>{formatValue(statusStr.replace(/_/g, ' '))}</span>
                            </div>
                        </div>
                    );
                }
            },
            {
                id: 'remarks',
                header: 'REMARKS',
                align: 'center',
                render: (land: any) => (
                    <div className="flex justify-center">
                        <div className="max-w-[150px] truncate text-xs italic text-gray-500" title={land.remarks || land.remarks_stage1 || land.remarks_stage2}>
                            {formatValue(land.remarks || land.remarks_stage1 || land.remarks_stage2)}
                        </div>
                    </div>
                )
            },
            {
                id: 'land_status',
                header: 'LAND_STATUS',
                align: 'center',
                render: (land: any) => (
                    <div className="flex justify-center">
                        <div className="inline-flex items-center text-brand-600 dark:text-brand-400">
                            <span className="text-xs font-bold uppercase tracking-wider">
                                {formatValue(land.land_status)}
                            </span>
                        </div>
                    </div>
                )
            },
            {
                id: 'is_active',
                header: 'IS_ACTIVE',
                align: 'center',
                render: (land: any) => (
                    <div className="flex justify-center">
                        <div className="inline-flex items-center text-blue-600 dark:text-blue-400">
                            <span className="text-[10px] font-bold uppercase tracking-widest">{land.is_active ? 'YES' : 'NO'}</span>
                        </div>
                    </div>
                )
            },
            // {
            //     id: 'agent_name',
            //     header: 'AGENT_NAME',
            //     render: (land: any) => <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{formatValue(land.agent_name || land.added_by_name)}</span>
            // },
            // {
            //     id: 'agent_contact',
            //     header: 'AGENT_CONTACT',
            //     render: (land: any) => <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{formatValue(land.agent_contact || land.agent_phone)}</span>
            // }
        ];
    }, [lands]);

    const getTabLabel = (tab: 'pending' | 'admin_pending' | 'approved' | 'active_land' | 'rejected') => {
        if (isAdminView) {
            if (tab === 'pending') return 'FO Approved';
            if (tab === 'admin_pending') return 'Admin Pending';
            if (tab === 'approved') return 'Admin Approved';
            if (tab === 'active_land') return 'Active Land';
            if (tab === 'rejected') return 'Admin Rejected';
        } else {
            if (tab === 'pending') return 'Pending Review';
            if (tab === 'approved') return 'FO Approved';
            if (tab === 'rejected') return 'FO Rejected';
        }
        return tab.charAt(0).toUpperCase() + tab.slice(1);
    };

    return (
        <div className="space-y-6">
            {/* Sub Tabs */}
            {/* Sub Tabs Pill Style */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
                {(isAdminView ? ['admin_pending', 'approved', 'active_land', 'rejected'] : ['pending', 'approved', 'rejected'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveSubTab(tab as any)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-200 border ${activeSubTab === tab
                            ? 'bg-green-600 border-green-600 text-white shadow-sm'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-green-300 dark:hover:border-green-800 hover:text-green-600 dark:hover:text-green-400'
                            }`}
                    >
                        {getTabLabel(tab as any)}
                    </button>
                ))}
            </div>

            {/* Table or Empty State */}
            {isLoading ? (
                <div className="py-20 text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto" />
                    <p className="text-gray-500 mt-2 text-sm">Loading lands...</p>
                </div>
            ) : !lands || lands.length === 0 ? (
                <div className="py-20 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    <FileIcon className="size-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No Lands Found</h3>
                    <p className="text-gray-500 text-sm">No land records in {getTabLabel(activeSubTab)} state.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-2xl shadow-gray-200/40 dark:shadow-none overflow-hidden mt-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    {columns.map((col, idx) => (
                                        <th key={col.id} className={`py-5 ${idx === 0 ? 'pl-8' : 'px-4'} text-[10px] font-black text-gray-400 uppercase tracking-widest ${(col as any).align === 'center' ? 'text-center' : 'text-left'}`}>
                                            <div className={`flex ${(col as any).align === 'center' ? 'justify-center' : 'justify-start'}`} style={{ minWidth: (col as any).minWidth || 'auto' }}>
                                                {col.header}
                                            </div>
                                        </th>
                                    ))}
                                    {canApprove && (
                                        <th className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                                            <div className="min-w-[90px] flex justify-center">ACTIONS</div>
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {lands.map((land: any, index: number) => (
                                    <tr
                                        key={land.id}
                                        onClick={() => handleRowClick(land)}
                                        className="hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-all duration-200 group cursor-pointer"
                                    >
                                        {columns.map((col, colIdx) => (
                                            <td key={(col as any).id} className={`py-5 align-top ${colIdx === 0 ? 'pl-8' : 'px-4'} ${(col as any).align === 'center' ? 'text-center' : ''}`}>
                                                {(col as any).render(land, index)}
                                            </td>
                                        ))}
                                        {canApprove && (
                                            <td className="py-5 px-4 text-center align-top" onClick={(e) => e.stopPropagation()}>
                                                {remarkingLandId === land.id ? (
                                                    <div className="flex flex-col items-center gap-2 min-w-[200px]">
                                                        <textarea
                                                            value={tempRemarks}
                                                            onChange={(e) => setTempRemarks(e.target.value)}
                                                            placeholder="Enter remarks..."
                                                            className="w-full p-2 text-[11px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg focus:ring-1 focus:ring-green-500 outline-none resize-none"
                                                            rows={2}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleRemarkSubmit(land)}
                                                                className="flex-1 px-2 py-1 text-[10px] font-bold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                                                            >
                                                                Submit
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setRemarkingLandId(null);
                                                                    setTempRemarks("");
                                                                }}
                                                                className="flex-1 px-2 py-1 text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <button
                                                            onClick={() => handleActionClick(land, 'APPROVE')}
                                                            className="px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 transition-all border border-green-200/50 dark:border-green-800/50"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleActionClick(land, 'REJECT')}
                                                            className="px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-all border border-red-200/50 dark:border-red-800/50"
                                                        >
                                                            Reject
                                                        </button>
                                                        {activeSubTab === 'admin_pending' && (
                                                            <button
                                                                onClick={() => {
                                                                    setRemarkingLandId(land.id);
                                                                    setTempRemarks(land.remarks || "");
                                                                }}
                                                                className="px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-all border border-blue-200/50 dark:border-blue-800/50"
                                                            >
                                                                Remarks
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Action Popup Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-lg ${selectedLand?.action === 'APPROVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {selectedLand?.action === 'APPROVE' ? (
                                        <CheckCircleIcon className="size-6" />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {selectedLand?.action === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
                                </h3>
                            </div>

                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                                Are you sure you want to {selectedLand?.action.toLowerCase()} land ID <span className="text-gray-900 dark:text-white font-bold">#{selectedLand?.land?.landId || selectedLand?.land?.id}</span>?
                                {selectedLand?.action === 'REJECT' && " Remarks are required."}
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Remarks / Reason</label>
                                    <textarea
                                        rows={4}
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder={`Enter ${selectedLand?.action.toLowerCase()} remarks here...`}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all dark:text-white resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedLand(null);
                                }}
                                className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAction}
                                className={`flex-[1.5] px-4 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-95 ${selectedLand?.action === 'APPROVE'
                                    ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20'
                                    : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'}`}
                            >
                                Confirm {selectedLand?.action === 'APPROVE' ? 'Approve' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
