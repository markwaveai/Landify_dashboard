import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { RootState } from "../../store/store";
import { getLands, getLandsByReference } from "../../services/landService";
import LandApprovalsTabContent from "../../components/dashboard/LandApprovalsTabContent";
import PageMeta from "../../components/common/PageMeta";
import { CheckCircleIcon } from "../../icons";

export default function AdminApprovalsPage() {
    const { user } = useSelector((state: RootState) => state.auth);
    const { data: lands, isLoading } = useQuery({
        queryKey: ['lands', user?.reference_id, user?.unique_id],
        queryFn: () => {
            const adminId = user?.reference_id || user?.unique_id;
            if (adminId) {
                return getLandsByReference(adminId);
            }
            return getLands();
        },
        staleTime: 10000,
        refetchOnWindowFocus: false,
    });

    // Derived Statistics - Lands
    const landStats = useMemo(() => {
        const allLands = lands || [];

        // Admin Specific Statuses
        const adminReady = allLands.filter((l: any) => l.status === 'FO_APPROVED').length;
        const adminPending = allLands.filter((l: any) => l.status === 'ADMIN_PENDING').length;
        const adminApproved = allLands.filter((l: any) => l.status === 'ADMIN_APPROVED').length;
        const adminRejected = allLands.filter((l: any) => l.status === 'ADMIN_REJECTED').length;
        const adminTotal = adminReady + adminPending + adminApproved + adminRejected;

        return {
            adminTotal,
            adminReady,
            adminPending,
            adminApproved,
            adminRejected
        };
    }, [lands]);

    return (
        <>
            <PageMeta title="Admin Approvals | Landify" description="Final management of FO approved requests" />

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 dark:border-gray-800 pb-1">
                    <div className="pb-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1.5">
                            Admin Approvals
                        </h2>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Final management of FO approved requests
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                        <div className="flex items-start justify-between">
                            <div className="flex bg-blue-50 p-2 rounded-lg text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full dark:bg-blue-900/20 dark:text-blue-400">In Progress</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Pending</p>
                            <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">{landStats.adminPending}</h4>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                        <div className="flex items-start justify-between">
                            <div className="flex bg-green-50 p-2 rounded-lg text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                <CheckCircleIcon className="size-6" />
                            </div>
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full dark:bg-green-900/20 dark:text-green-400">Final</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Approved</p>
                            <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">{landStats.adminApproved}</h4>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                        <div className="flex items-start justify-between">
                            <div className="flex bg-red-50 p-2 rounded-lg text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full dark:bg-red-900/20 dark:text-red-400">Rejected</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Rejected</p>
                            <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">{landStats.adminRejected}</h4>
                        </div>
                    </div>
                </div>
                <LandApprovalsTabContent isAdminView lands={lands} isLoading={isLoading} />
            </div>
        </>
    );
}
