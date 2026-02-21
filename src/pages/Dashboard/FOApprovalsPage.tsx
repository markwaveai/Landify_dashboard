import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLands } from "../../services/landService";
import LandApprovalsTabContent from "../../components/dashboard/LandApprovalsTabContent";
import PageMeta from "../../components/common/PageMeta";
import { GroupIcon, FileIcon } from "../../icons";

export default function FOApprovalsPage() {
    const { data: lands, isLoading } = useQuery({
        queryKey: ['lands'],
        queryFn: getLands,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });

    // Derived Statistics - Lands
    const landStats = useMemo(() => {
        const allLands = lands || [];

        // FO Specific Statuses
        const foPending = allLands.filter((l: any) => {
            const s = (l.status || '').toUpperCase();
            return (s.includes('PENDING') || s === 'SUBMITTED') && s !== 'ADMIN_PENDING';
        }).length;
        const foApproved = allLands.filter((l: any) => l.status === 'FO_APPROVED').length;
        const foRejected = allLands.filter((l: any) => l.status === 'FO_REJECTED').length;
        const foTotal = foPending + foApproved + foRejected;

        return {
            foTotal,
            foPending,
            foApproved,
            foRejected,
        };
    }, [lands]);

    return (
        <>
            <PageMeta title="FO Approvals | Landify" description="Review land registration requests" />

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 dark:border-gray-800 pb-1">
                    <div className="pb-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1.5">
                            FO Approvals
                        </h2>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Review land registration requests
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                        <div className="flex items-start justify-between">
                            <div className="flex bg-green-50 p-2 rounded-lg text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                <GroupIcon className="size-6" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Requests</p>
                            <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">{landStats.foTotal}</h4>
                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                        <div className="flex items-start justify-between">
                            <div className="flex bg-yellow-50 p-2 rounded-lg text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
                                <FileIcon className="size-6" />
                            </div>
                            <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full dark:bg-yellow-900/20 dark:text-yellow-400">Pending</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Approvals</p>
                            <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">{landStats.foPending}</h4>
                        </div>
                    </div>
                </div>
                <LandApprovalsTabContent lands={lands} isLoading={isLoading} />
            </div>
        </>
    );
}
