import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useQuery } from "@tanstack/react-query";
import { getAgents } from "../../services/userService";
import AgentTable from "../../components/dashboard/AgentTable";
import LandApprovalsTabContent from "../../components/dashboard/LandApprovalsTabContent";
import PageMeta from "../../components/common/PageMeta";
import AddAgentModal from "../../components/dashboard/AddAgentModal";
import { GroupIcon, BoxCubeIcon } from "../../icons";

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
    const [searchQuery, setSearchQuery] = useState("");

    const { data: agents, isLoading: isLoadingAgents } = useQuery({
        queryKey: ['agents'],
        queryFn: getAgents,
        enabled: user?.role === 'ADMIN' || user?.role === 'AGRICULTURE_OFFICER'
    });


    const canAdd = user?.role === 'AGRICULTURE_OFFICER';

    const navigate = useNavigate();

    const handleAgentClick = (agent: any) => {
        navigate(`/agents/${agent.phone_number}`);
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
        if (!enrichedAgents.length) return { active: 0, villages: 0 };
        return {
            active: enrichedAgents.filter((a: any) => a.status_label === 'ACTIVE').length,
            villages: (new Set(enrichedAgents.map((a: any) => a.village))).size
        };
    }, [enrichedAgents]);

    return (
        <>
            <PageMeta title={user?.role === 'AGENT' ? "Lands Status | Landify" : "Agents Management | Landify"} description="Manage Agents" />
            <div className="space-y-6">
                {(user?.role === 'ADMIN' || user?.role === 'AGRICULTURE_OFFICER') && (
                    <>
                        {/* Search Box Section */}
                        <div className="w-full bg-white dark:bg-white/[0.03] p-1.5 rounded-xl border border-gray-200 dark:border-gray-800">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg leading-5 bg-transparent placeholder-gray-400 focus:outline-none text-gray-900 dark:text-gray-100 sm:text-sm"
                                    placeholder="Search by name, village, or officer..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <AgentTable
                            title="Agents Management"
                            users={filteredAgents}
                            isLoading={isLoadingAgents}
                            addLabel={canAdd ? "Add Agent" : undefined}
                            onAddClick={canAdd ? () => { setSelectedAgent(null); setShowModal(true); } : undefined}
                            onRowClick={handleAgentClick}
                        />

                        {/* Summary Stats Cards */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {/* Total Active Agents */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                                        <GroupIcon className="size-6 text-gray-800 dark:text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Active Agents</p>
                                        <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90 mt-1">
                                            {stats.active}
                                        </h4>
                                    </div>
                                </div>
                            </div>



                            {/* Villages Covered */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                                        <BoxCubeIcon className="size-6 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Villages Covered</p>
                                        <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90 mt-1">
                                            {stats.villages}
                                        </h4>
                                    </div>
                                </div>
                            </div>
                        </div>
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
