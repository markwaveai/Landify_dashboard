import { useState } from "react";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RootState } from "../../store/store";
import { getLandApprovals, approveLandStage1, approveLandStage2 } from "../../services/landService";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import LandDetailsModal from "../../components/dashboard/LandDetailsModal";

export default function LandApprovalsPage() {
    const { user } = useSelector((state: RootState) => state.auth);
    const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
    const [selectedLand, setSelectedLand] = useState<any>(null); // For Approval/Rejection
    const [viewLand, setViewLand] = useState<any>(null); // For Viewing Details (Modal)
    const [action, setAction] = useState<'APPROVE' | 'REJECT' | null>(null);
    const [reason, setReason] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const queryClient = useQueryClient();

    const { data: lands, isLoading } = useQuery({
        queryKey: ['land-approvals', statusFilter],
        queryFn: () => getLandApprovals(statusFilter),
        enabled: !!user?.role,
        staleTime: 5000,
    });

    const mutationStage1 = useMutation({
        mutationFn: (data: { id: number, action: 'APPROVE' | 'REJECT', reason: string }) =>
            approveLandStage1(data.id, { action: data.action, reason: data.reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['land-approvals'] });
            setSelectedLand(null);
            setAction(null);
            setReason("");
        }
    });

    const mutationStage2 = useMutation({
        mutationFn: (data: { id: number, action: 'APPROVE' | 'REJECT', reason: string }) =>
            approveLandStage2(data.id, { action: data.action, reason: data.reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['land-approvals'] });
            setSelectedLand(null);
            setAction(null);
            setReason("");
        }
    });

    const handleAction = () => {
        if (!selectedLand || !action) return;

        if (user?.role === 'FIELD_OFFICER') {
            mutationStage1.mutate({ id: selectedLand.id, action, reason });
        } else if (user?.role === 'ADMIN') {
            mutationStage2.mutate({ id: selectedLand.id, action, reason });
        }
    };

    const openActionModal = (land: any, act: 'APPROVE' | 'REJECT', e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click from opening details
        setSelectedLand(land);
        setAction(act);
        if (act === 'APPROVE') setReason('Approved');
        else setReason('');
    };

    return (
        <>
            <PageMeta title="Land Approvals | Landify" description="Manage Land Approvals" />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Appropriations
                    </h2>
                    <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        {(['pending', 'approved', 'rejected'] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === s
                                    ? "bg-white dark:bg-gray-700 text-primary-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    }`}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* We need a table that has actions if pending */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                    <div className="max-w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800 text-left">
                                    <th className="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">ID</th>
                                    <th className="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Survey No</th>
                                    <th className="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Area</th>
                                    <th className="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Type</th>
                                    <th className="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Owner</th>
                                    <th className="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Status</th>
                                    <th className="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {lands?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((land: any, index: number) => (
                                    <tr
                                        key={land.id}
                                        className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] cursor-pointer"
                                        onClick={() => setViewLand(land)}
                                    >
                                        <td className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                            <span className="text-xs font-bold font-mono">{(currentPage - 1) * itemsPerPage + index + 1}</span>
                                        </td>
                                        <td className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{land.survey_no}</td>
                                        <td className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{land.area_in_acres} ac</td>
                                        <td className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{land.land_type || '-'}</td>
                                        <td className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{land.ownership_details || '-'}</td>
                                        <td className="py-3">
                                            <Badge size="sm" color={
                                                land.status === 'PENDING' ? 'warning' :
                                                    land.status.includes('APPROVED') ? 'success' : 'error'
                                            }>
                                                {land.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3">
                                            {statusFilter === 'pending' && user?.role !== 'AGENT' && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={(e) => openActionModal(land, 'APPROVE', e)}
                                                        className="text-green-600 hover:text-green-700 ring-green-200 hover:ring-green-300 hover:bg-green-50 dark:text-green-400 dark:ring-green-900 dark:hover:bg-green-900/20"
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={(e) => openActionModal(land, 'REJECT', e)}
                                                        className="text-red-600 hover:text-red-700 ring-red-200 hover:ring-red-300 hover:bg-red-50 dark:text-red-400 dark:ring-red-900 dark:hover:bg-red-900/20"
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {isLoading && (
                                    <tr><td colSpan={7} className="py-4 text-center text-gray-500">Loading...</td></tr>
                                )}
                                {!isLoading && (!lands || lands.length === 0) && (
                                    <tr><td colSpan={7} className="py-4 text-center text-gray-500">No records found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination UI */}
                {lands && lands.length > itemsPerPage && (
                    <div className="flex items-center justify-between mt-4 px-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, lands.length)} of {lands.length}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(lands.length / itemsPerPage)))}
                                disabled={currentPage >= Math.ceil(lands.length / itemsPerPage)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {selectedLand && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl p-6 shadow-xl">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                            {action === 'APPROVE' ? 'Approve Land' : 'Reject Land'}
                        </h3>
                        <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
                            Are you sure you want to {action?.toLowerCase()} land #{selectedLand.id} (Survey: {selectedLand.survey_no})?
                        </p>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {action === 'APPROVE' ? 'Remarks (Optional)' : 'Reason for Rejection *'}
                            </label>
                            <textarea
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                rows={3}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder={action === 'APPROVE' ? "Looks good..." : "Incorrect details..."}
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setSelectedLand(null)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAction}
                                variant={action === 'APPROVE' ? 'primary' : 'outline'}
                                className={action === 'REJECT' ? 'border-error-500 text-error-500 hover:bg-error-50' : ''}
                                disabled={action === 'REJECT' && !reason.trim()}
                            >
                                {action === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            <LandDetailsModal
                isOpen={!!viewLand}
                onClose={() => setViewLand(null)}
                land={viewLand}
            />
        </>
    );
}
