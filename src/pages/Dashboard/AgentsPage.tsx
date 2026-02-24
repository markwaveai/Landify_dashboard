import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useQuery } from "@tanstack/react-query";
import { getAgents } from "../../services/userService";
import AgentTable from "../../components/dashboard/AgentTable";
import LandApprovalsTabContent from "../../components/dashboard/LandApprovalsTabContent";
import PageMeta from "../../components/common/PageMeta";
import AddAgentModal from "../../components/dashboard/AddAgentModal";
import { UserIcon } from "../../icons";

// Helper for deterministic mock data based on phone number/id
const getConsistentRandom = (seedStr: string, max: number) => {
    let hash = 0;
    if (!seedStr) return 0;
    for (let i = 0; i < seedStr.length; i++) {
        hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % max);
};

const officers = ["Mike Smith", "Robert Vance", "Sarah James", "Emily Davis", "John Doe"];


// Simple Search Icon Component since it wasn't exported from icons
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

export default function AgentsPage() {
    const { user } = useSelector((state: RootState) => state.auth);
    const [showModal, setShowModal] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<any>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");
    const searchQuery = searchParams.get("q") || "";

    const { data: agents, isLoading: isLoadingAgents } = useQuery({
        queryKey: ['agents'],
        queryFn: getAgents,
        enabled: user?.role === 'ADMIN' || user?.role === 'FIELD_OFFICER'
    });

    const handlePageChange = (page: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", page.toString());
        setSearchParams(newParams, { replace: true });
    };

    const handleSearchChange = (query: string) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("q", query);
        newParams.set("page", "1"); // Reset to page 1 on new search
        setSearchParams(newParams, { replace: true });
    };


    const canAdd = user?.role === 'FIELD_OFFICER';

    const navigate = useNavigate();

    const handleAgentClick = (agent: any) => {
        navigate(`/agents/${agent.unique_id}`);
    };

    // Enrich agents with mock data for the new UI columns
    const enrichedAgents = useMemo(() => {
        if (!agents || !Array.isArray(agents)) return [];
        return agents.map((agent: any) => {
            const seed = agent.phone_number || agent.unique_id || "default";
            const officerIndex = getConsistentRandom(seed, officers.length);
            // Determine active status based on steps if available, or random mock
            let statusLabel: 'ACTIVE' | 'INACTIVE' = 'INACTIVE';
            if (agent.is_step1_completed && agent.is_step2_completed) {
                statusLabel = 'ACTIVE';
            } else if (getConsistentRandom(seed + "active", 10) > 3) {
                // Fallback mock
                statusLabel = 'ACTIVE';
            }

            return {
                ...agent,
                assigned_officer_name: officers[officerIndex],
                status_label: statusLabel,
            };
        });
    }, [agents]);

    // Filter agents based on search query
    const filteredAgents = useMemo(() => {
        let data = enrichedAgents;
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            data = data.filter((agent: any) =>
                (agent.first_name + " " + agent.last_name).toLowerCase().includes(lowerQuery) ||
                (agent.village || "").toLowerCase().includes(lowerQuery) ||
                (agent.assigned_officer_name || "").toLowerCase().includes(lowerQuery) ||
                (agent.phone_number || "").includes(lowerQuery)
            );
        }
        return data;
    }, [enrichedAgents, searchQuery]);

    const stats = useMemo(() => {
        if (!enrichedAgents.length) return { active: 0, total: 0 };
        return {
            active: enrichedAgents.filter((a: any) => a.status_label === 'ACTIVE').length,
            total: enrichedAgents.length
        };
    }, [enrichedAgents]);

    return (
        <>
            <PageMeta title={user?.role === 'AGENT' ? "Lands Status | Landify" : "Agents Management | Landify"} description="Manage Agents" />
            <div className="space-y-6">
                {(user?.role === 'ADMIN' || user?.role === 'FIELD_OFFICER') && (
                    <>
                        {/* Search & Stats Header Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                            {/* Search Box - Takes 6 columns on large screens */}
                            <div className="lg:col-span-6 w-full bg-white dark:bg-white/[0.03] p-1.5 rounded-xl border border-gray-200 dark:border-gray-800">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <SearchIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg leading-5 bg-transparent placeholder-gray-400 focus:outline-none text-gray-900 dark:text-gray-100 sm:text-sm"
                                        placeholder="Search by name, village, or officer..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Stats Section - Takes 6 columns on large screens */}
                            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Total Active Agents */}
                                <div className="rounded-2xl border border-gray-200 bg-white p-3.5 dark:border-gray-800 dark:bg-white/[0.03]">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300 shrink-0">
                                            <UserIcon className="size-5 text-gray-800 dark:text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Active Agents</p>
                                            <h4 className="text-xl font-black text-gray-800 dark:text-white/90">
                                                {stats.active}
                                            </h4>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Agents */}
                                <div className="rounded-2xl border border-gray-200 bg-white p-3.5 dark:border-gray-800 dark:bg-white/[0.03]">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 shrink-0">
                                            <UserIcon className="size-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Total Agents</p>
                                            <h4 className="text-xl font-black text-gray-800 dark:text-white/90">
                                                {stats.total}
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <AgentTable
                            title="Agents Management"
                            users={filteredAgents}
                            isLoading={isLoadingAgents}
                            addLabel={canAdd ? "Add Agent" : undefined}
                            onAddClick={canAdd ? () => { setSelectedAgent(null); setShowModal(true); } : undefined}
                            onRowClick={handleAgentClick}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}

                {user?.role === 'AGENT' && (
                    <LandApprovalsTabContent />
                )}
            </div>
            <AddAgentModal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setSelectedAgent(null); }}
                agent={selectedAgent}
            />
        </>
    );
}
