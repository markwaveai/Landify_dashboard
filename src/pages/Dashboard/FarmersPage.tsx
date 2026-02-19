import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFarmers } from "../../services/userService";
import FarmerTable from "../../components/dashboard/FarmerTable";
import PageMeta from "../../components/common/PageMeta";
import { GroupIcon, FileIcon, CheckCircleIcon } from "../../icons";

// Helper for deterministic mock data
const getConsistentRandom = (seedStr: string, max: number) => {
    let hash = 0;
    if (!seedStr) return 0;
    for (let i = 0; i < seedStr.length; i++) {
        hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % max);
};

export default function FarmersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [villageFilter, setVillageFilter] = useState("All Villages");
    const [statusFilter, setStatusFilter] = useState("All Status");

    const { data: farmers, isLoading: isLoadingFarmers } = useQuery({
        queryKey: ['farmers'],
        queryFn: getFarmers,
        refetchInterval: 10000,
    });

    // Enrich farmers with mock data for the new UI columns
    const enrichedFarmers = useMemo(() => {
        if (!farmers || !Array.isArray(farmers)) return [];
        return farmers.map((farmer: any) => {
            const seed = farmer.phone_number || farmer.unique_id || "default";

            const bondYears = getConsistentRandom(seed + "bond", 5) + 1;
            const paid = getConsistentRandom(seed + "pay", 10) > 3;

            return {
                ...farmer,
                bond_duration: `${bondYears} Years`,
                payment_status: paid ? 'Paid' : 'Pending',
                agreement_docs: true,
                status: farmer.status || (farmer.is_step1_completed ? "Active" : "Pending Step 1")
            };
        });
    }, [farmers]);

    // Derived Statistics - Farmers
    const stats = useMemo(() => {
        const total = enrichedFarmers.length;
        const activeCount = enrichedFarmers.filter((f: any) => f.is_active === true).length;
        const pendingCount = enrichedFarmers.filter((f: any) =>
            f.status?.toLowerCase().includes('pending') ||
            f.Status?.toLowerCase().includes('pending')
        ).length;

        return { total, activeCount, pendingCount };
    }, [enrichedFarmers]);

    // Filtering
    const filteredFarmers = useMemo(() => {
        let data = enrichedFarmers;

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            data = data.filter((f: any) =>
                (f.first_name + " " + f.last_name).toLowerCase().includes(lowerQuery) ||
                (f.village || "").toLowerCase().includes(lowerQuery) ||
                (f.phone_number || "").includes(lowerQuery)
            );
        }

        if (villageFilter !== "All Villages") {
            data = data.filter((f: any) => f.village === villageFilter);
        }

        return data;
    }, [enrichedFarmers, searchQuery, villageFilter]);

    // Unique Villages for Filter
    const villages = useMemo(() => {
        const v = new Set(enrichedFarmers.map((f: any) => f.village).filter(Boolean));
        return ["All Villages", ...Array.from(v)];
    }, [enrichedFarmers]);

    return (
        <>
            <PageMeta title="Farmers | Landify" description="Manage Farmers" />

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 dark:border-gray-800 pb-1">
                    <div className="pb-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1.5">
                            Farmers
                        </h2>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Farmers Pending Documents
                        </p>
                    </div>
                </div>

                {/* Stats Cards Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                        <div className="flex items-start justify-between">
                            <div className="flex bg-green-50 p-2 rounded-lg text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                <GroupIcon className="size-6" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Farmers</p>
                            <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">{stats.total.toLocaleString()}</h4>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                        <div className="flex items-start justify-between">
                            <div className="flex bg-blue-50 p-2 rounded-lg text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                <CheckCircleIcon className="size-6" />
                            </div>
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full dark:bg-blue-900/20 dark:text-blue-400">Active</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Farmers</p>
                            <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">{stats.activeCount}</h4>
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
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Farmers</p>
                            <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">{stats.pendingCount}</h4>
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="relative flex-1 max-w-lg">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6 m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, ID or village..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                        <select
                            className="form-select block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={villageFilter}
                            onChange={(e) => setVillageFilter(e.target.value)}
                        >
                            {villages.map(v => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </select>

                        <select
                            className="form-select block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All Status">Payment Status</option>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                        </select>

                        <button className="p-2 text-gray-500 hover:text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-gray-50/50 dark:bg-gray-900/50 rounded-xl">
                    <FarmerTable
                        users={filteredFarmers}
                        isLoading={isLoadingFarmers}
                    />
                </div>
            </div>
        </>
    );
}
