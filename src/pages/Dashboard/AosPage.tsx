import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useQuery } from "@tanstack/react-query";
import { getAOs } from "../../services/userService";
import UserTable from "../../components/dashboard/UserTable";
import PageMeta from "../../components/common/PageMeta";
import AddOfficerModal from "../../components/dashboard/AddOfficerModal";

export default function AosPage() {
    const { user } = useSelector((state: RootState) => state.auth);
    const [showModal, setShowModal] = useState(false);

    const { data: aos, isLoading } = useQuery({
        queryKey: ['aos'],
        queryFn: getAOs,
        enabled: user?.role === 'ADMIN'
    });

    if (user?.role !== 'ADMIN') {
        return <div className="p-6 text-error-500">Access Denied</div>;
    }

    return (
        <>
            <PageMeta title="Agricultural Officers | Landify" description="Manage Agricultural Officers" />
            <div className="space-y-6">
                <UserTable
                    title="Agricultural Officers"
                    users={aos || []}
                    isLoading={isLoading}
                    addLabel="Add Officer"
                    onAddClick={() => setShowModal(true)}
                />
            </div>
            <AddOfficerModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </>
    );
}
