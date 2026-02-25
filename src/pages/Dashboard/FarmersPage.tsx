import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getFarmers } from "../../services/userService";
import FarmerTable from "../../components/dashboard/FarmerTable";
import PageMeta from "../../components/common/PageMeta";
import { UserIcon } from "../../icons";

// Simple Search Icon Component
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

export default function FarmersPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");
    const searchQuery = searchParams.get("q") || "";

    const { data: farmers, isLoading: isLoadingFarmers } = useQuery({
        queryKey: ['farmers'],
        queryFn: getFarmers,
    });

    const handlePageChange = (page: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", page.toString());
        setSearchParams(newParams, { replace: true });
    };

    const handleSearchChange = (query: string) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("q", query);
        newParams.set("page", "1"); // Reset on search
        setSearchParams(newParams, { replace: true });
    };

    // Filtering
    const filteredFarmers = useMemo(() => {
        if (!farmers || !Array.isArray(farmers)) return [];
        let data = farmers;

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            data = data.filter((f: any) =>
                (f.first_name + " " + f.last_name).toLowerCase().includes(lowerQuery) ||
                (f.village || "").toLowerCase().includes(lowerQuery) ||
                (f.phone_number || "").includes(lowerQuery) ||
                (f.unique_id || "").toLowerCase().includes(lowerQuery)
            );
        }

        return data;
    }, [farmers, searchQuery]);



    const stats = useMemo(() => {
        if (!farmers || !Array.isArray(farmers)) return { total: 0, active: 0, pending: 0 };
        const total = farmers.length;
        const active = farmers.filter((f: any) => f.is_active === true).length;
        const pending = farmers.filter((f: any) =>
            f.status?.toLowerCase().includes('pending') ||
            !f.is_active
        ).length;

        return { total, active, pending };
    }, [farmers]);

    return (
        <>
            <PageMeta title="Farmers Management | Landify" description="Manage Farmers" />
            <div className="space-y-6">

                {/* Search & Stats Header Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    {/* Search Box */}
                    <div className="lg:col-span-5 w-full bg-white dark:bg-white/[0.03] p-1.5 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-2">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg leading-5 bg-transparent placeholder-gray-400 focus:outline-none text-gray-900 dark:text-gray-100 sm:text-sm"
                                placeholder="Search by name, ID or village..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Total Farmers */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-3.5 dark:border-gray-800 dark:bg-white/[0.03]">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300 shrink-0">
                                    <UserIcon className="size-5 text-gray-800 dark:text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Total Farmers</p>
                                    <h4 className="text-xl font-black text-gray-800 dark:text-white/90">{stats.total}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <FarmerTable
                    title="Farmers Management"
                    users={filteredFarmers}
                    isLoading={isLoadingFarmers}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                />
            </div>
        </>
    );
}
