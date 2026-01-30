import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useQuery } from "@tanstack/react-query";
import { getAgents } from "../../services/userService";
import { getLands } from "../../services/landService";
import UserTable from "../../components/dashboard/UserTable";
import LandTable from "../../components/dashboard/LandTable";
import PageMeta from "../../components/common/PageMeta";
import AddAgentModal from "../../components/dashboard/AddAgentModal";

export default function AgentsPage() {
    const { user } = useSelector((state: RootState) => state.auth);
    const [showModal, setShowModal] = useState(false);

    const { data: agents, isLoading: isLoadingAgents } = useQuery({
        queryKey: ['agents'],
        queryFn: getAgents,
        enabled: user?.role === 'ADMIN' || user?.role === 'AGRICULTURE_OFFICER'
    });

    const { data: lands, isLoading: isLoadingLands } = useQuery({
        queryKey: ['lands'],
        queryFn: getLands,
        enabled: user?.role === 'AGENT'
    });

    const canAdd = user?.role === 'AGRICULTURE_OFFICER';

    return (
        <>
            <PageMeta title={user?.role === 'AGENT' ? "Lands Status | Landify" : "Agents | Landify"} description="Manage Agents" />
            <div className="space-y-6">
                {(user?.role === 'ADMIN' || user?.role === 'AGRICULTURE_OFFICER') && (
                    <UserTable
                        title={user?.role === 'AGRICULTURE_OFFICER' ? "My Agents" : "All Agents"}
                        users={agents || []}
                        isLoading={isLoadingAgents}
                        addLabel={canAdd ? "Add Agent" : undefined}
                        onAddClick={canAdd ? () => setShowModal(true) : undefined}
                    />
                )}

                {user?.role === 'AGENT' && (
                    <LandTable
                        title="Farmers' Lands Status"
                        lands={lands || []}
                        isLoading={isLoadingLands}
                    />
                )}
            </div>
            <AddAgentModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </>
    );
}
