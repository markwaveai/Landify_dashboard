
import { useState } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useQuery } from "@tanstack/react-query";
import { getAOs } from "../../services/userService";
import OfficerTable from "../../components/dashboard/OfficerTable";
import PageMeta from "../../components/common/PageMeta";
import AddOfficerModal from "../../components/dashboard/AddOfficerModal";


export default function AosPage() {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [showModal, setShowModal] = useState(false);
    const [selectedOfficer, setSelectedOfficer] = useState<any>(null);

    const { data: aos, isLoading } = useQuery({
        queryKey: ['aos'],
        queryFn: getAOs,
        enabled: user?.role === 'ADMIN'
    });

    if (user?.role !== 'ADMIN') {
        return <div className="p-6 text-error-500">Access Denied</div>;
    }

    const handleEdit = (officer: any) => {
        setSelectedOfficer(officer);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedOfficer(null);
    };

    return (
        <>
            <PageMeta title="Field Officers | Landify" description="Manage Field Officers" />

            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        Field Officers
                    </h2>

                </div>
                <div className="flex items-center gap-3">
                    <button
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-3 text-sm font-medium text-white hover:bg-green-800 transition-colors shadow-sm"
                        onClick={() => { setSelectedOfficer(null); setShowModal(true); }}
                    >

                        <span>+ Add Field Officer</span>
                    </button>
                    {/* Settings/Filter Icon could go here if needed as per design */}
                </div>
            </div>

            <div className="space-y-6">
                <OfficerTable
                    users={aos || []}
                    isLoading={isLoading}
                    onEdit={handleEdit}
                    onDelete={(user) => console.log("Delete", user)}
                    onView={(user) => navigate(`/aos/${user.phone_number}`)}
                />
            </div>
            <AddOfficerModal
                isOpen={showModal}
                onClose={handleCloseModal}
                user={selectedOfficer}
            />
        </>
    );
}
