import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLands, getLandsByReference } from "../../services/landService";
import LandApprovalsTabContent from "../../components/dashboard/LandApprovalsTabContent";
import PageMeta from "../../components/common/PageMeta";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { GroupIcon, FileIcon, UserCircleIcon, CheckCircleIcon } from "../../icons";

export default function ApprovalsPage() {
    const { user } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState<'fo' | 'admin'>(() => {
        return (localStorage.getItem('approvals_page_tab') as any) || 'fo';
    });

    const handleTabChange = (tab: 'fo' | 'admin') => {
        setActiveTab(tab);
        localStorage.setItem('approvals_page_tab', tab);
    };

    const { data: lands, isLoading } = useQuery({
        queryKey: ['lands', activeTab, user?.reference_id, user?.unique_id],
        queryFn: () => {
            const adminId = user?.reference_id || user?.unique_id;
            // Fetch dynamically based on Admin ID if available
            if (adminId) {
                return getLandsByReference(adminId);
            }
            return getLands();
        },
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: false,
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

        // Admin Specific Statuses
        const adminReady = allLands.filter((l: any) => l.status === 'FO_APPROVED').length;
        const adminPending = allLands.filter((l: any) => l.status === 'ADMIN_PENDING').length;
        const adminApproved = allLands.filter((l: any) => (l.status === 'ADMIN_APPROVED' || l.status === 'LAND_ACTIVATED') && !(l.land_status === 'ACTIVE' || String(l.land_status).toUpperCase() === 'ACTIVE')).length;
        const adminActive = allLands.filter((l: any) => (l.status === 'ADMIN_APPROVED' || l.status === 'LAND_ACTIVATED') && (l.land_status === 'ACTIVE' || String(l.land_status).toUpperCase() === 'ACTIVE')).length;
        const adminRejected = allLands.filter((l: any) => l.status === 'ADMIN_REJECTED').length;
        const adminTotal = adminReady + adminPending + adminApproved + adminRejected;

        return {
            foTotal,
            foPending,
            foApproved,
            foRejected,
            adminTotal,
            adminReady,
            adminPending,
            adminApproved,
            adminActive,
            adminRejected
        };
    }, [lands]);

    return (
        <>
            <PageMeta title="Approvals | Landify" description="Manage FO and Admin Approvals" />

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 dark:border-gray-800 pb-1">
                    <div className="pb-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1.5">
                            {activeTab === 'fo' ? "FO Approvals" : "Admin Approvals"}
                        </h2>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-300">
                            {activeTab === 'fo' ? "Review land registration requests" : "Final management of FO approved requests"}
                        </p>
                    </div>

                    {/* Tabs Segmented Control */}
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => handleTabChange('fo')}
                            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'fo'
                                ? "bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-md ring-1 ring-black/5"
                                : "text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                                }`}
                        >
                            <UserCircleIcon className="size-4.5" />
                            <span>FO Review</span>
                        </button>

                        <button
                            onClick={() => handleTabChange('admin')}
                            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'admin'
                                ? "bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-md ring-1 ring-black/5"
                                : "text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                                }`}
                        >
                            <UserCircleIcon className="size-4.5" />
                            <span>Admin Review</span>
                        </button>
                    </div>
                </div>

                {activeTab === 'fo' ? (
                    <>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-800">
                                <div className="flex items-start justify-between">
                                    <div className="flex bg-green-50 p-2.5 rounded-xl text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                        <GroupIcon className="size-6" />
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest">Total Requests</p>
                                    <h4 className="mt-1 text-3xl font-black text-gray-900 dark:text-white">{landStats.foTotal}</h4>
                                </div>
                            </div>
                            <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-800">
                                <div className="flex items-start justify-between">
                                    <div className="flex bg-amber-50 p-2.5 rounded-xl text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                                        <FileIcon className="size-6" />
                                    </div>
                                    <span className="text-[10px] font-black tracking-tighter text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full dark:bg-amber-900/20 dark:text-amber-400 uppercase">Attention Required</span>
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest">Pending FO Review</p>
                                    <h4 className="mt-1 text-3xl font-black text-gray-900 dark:text-white">{landStats.foPending}</h4>
                                </div>
                            </div>
                            <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-800">
                                <div className="flex items-start justify-between">
                                    <div className="flex bg-blue-50 p-2.5 rounded-xl text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                        <CheckCircleIcon className="size-6" />
                                    </div>
                                    <span className="text-[10px] font-black tracking-tighter text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full dark:bg-blue-900/20 dark:text-blue-400 uppercase">Verified</span>
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest">FO Approved</p>
                                    <h4 className="mt-1 text-3xl font-black text-gray-900 dark:text-white">{landStats.foApproved}</h4>
                                </div>
                            </div>
                            <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-800">
                                <div className="flex items-start justify-between">
                                    <div className="flex bg-rose-50 p-2.5 rounded-xl text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-black tracking-tighter text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full dark:bg-rose-900/20 dark:text-rose-400 uppercase">Declined</span>
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest">FO Rejected</p>
                                    <h4 className="mt-1 text-3xl font-black text-gray-900 dark:text-white">{landStats.foRejected}</h4>
                                </div>
                            </div>
                        </div>
                        <LandApprovalsTabContent key="fo-view" lands={lands} isLoading={isLoading} />
                    </>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-800">
                                <div className="flex items-start justify-between">
                                    <div className="flex bg-blue-50 p-2.5 rounded-xl text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full dark:bg-blue-900/20 dark:text-blue-400 uppercase tracking-tighter">In Review</span>
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest">Admin Pending</p>
                                    <h4 className="mt-1 text-3xl font-black text-gray-900 dark:text-white">{landStats.adminPending}</h4>
                                </div>
                            </div>
                            <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-800">
                                <div className="flex items-start justify-between">
                                    <div className="flex bg-emerald-50 p-2.5 rounded-xl text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                        <CheckCircleIcon className="size-6" />
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full dark:bg-emerald-900/20 dark:text-emerald-400 uppercase tracking-tighter">Verified</span>
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest">Admin Approved</p>
                                    <h4 className="mt-1 text-3xl font-black text-gray-900 dark:text-white">{landStats.adminApproved}</h4>
                                </div>
                            </div>
                            <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-800">
                                <div className="flex items-start justify-between">
                                    <div className="flex bg-cyan-50 p-2.5 rounded-xl text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-black text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full dark:bg-cyan-900/20 dark:text-cyan-400 uppercase tracking-tighter">Live</span>
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest">Active Land</p>
                                    <h4 className="mt-1 text-3xl font-black text-gray-900 dark:text-white">{landStats.adminActive}</h4>
                                </div>
                            </div>
                            <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-800">
                                <div className="flex items-start justify-between">
                                    <div className="flex bg-rose-50 p-2.5 rounded-xl text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full dark:bg-rose-900/20 dark:text-rose-400 uppercase tracking-tighter">Declined</span>
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest">Admin Rejected</p>
                                    <h4 className="mt-1 text-3xl font-black text-gray-900 dark:text-white">{landStats.adminRejected}</h4>
                                </div>
                            </div>
                        </div>
                        <LandApprovalsTabContent key="admin-view" isAdminView lands={lands} isLoading={isLoading} />
                    </>
                )}
            </div>
        </>
    );
}
