import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useQuery } from "@tanstack/react-query";
import { getAgents } from "../../services/userService";
import UserTable from "../../components/dashboard/UserTable";
import PageMeta from "../../components/common/PageMeta";
import AddAgentModal from "../../components/dashboard/AddAgentModal";

export default function AgentsPage() {
    const { user } = useSelector((state: RootState) => state.auth);
    const [showModal, setShowModal] = useState(false);

    const { data: agents, isLoading } = useQuery({
        queryKey: ['agents'],
        queryFn: getAgents,
        enabled: user?.role === 'ADMIN' || user?.role === 'AGRICULTURE_OFFICER'
    });

    const canAdd = user?.role === 'AGRICULTURE_OFFICER';

    return (
        <>
            <PageMeta title="Agents | Landify" description="Manage Agents" />
            <div className="space-y-6">
                <UserTable
                    title={user?.role === 'AGRICULTURE_OFFICER' ? "My Agents" : "All Agents"}
                    users={agents || []}
                    isLoading={isLoading}
                    addLabel={canAdd ? "Add Agent" : undefined}
                    onAddClick={canAdd ? () => setShowModal(true) : undefined}
                />
            </div>
            <AddAgentModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </>
    );
}
