import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useQuery } from "@tanstack/react-query";
import { getFarmers } from "../../services/userService";
import UserTable from "../../components/dashboard/UserTable";
import PageMeta from "../../components/common/PageMeta";
import AddFarmerModal from "../../components/dashboard/AddFarmerModal";
import AddLandModal from "../../components/dashboard/AddLandModal";

export default function FarmersPage() {
    const { user } = useSelector((state: RootState) => state.auth);
    const [showModal, setShowModal] = useState(false);
    const [showLandModal, setShowLandModal] = useState(false);
    const [selectedFarmer, setSelectedFarmer] = useState<any>(null);

    const { data: farmers, isLoading } = useQuery({
        queryKey: ['farmers'],
        queryFn: getFarmers,
        enabled: user?.role === 'ADMIN' || user?.role === 'AGRICULTURE_OFFICER' || user?.role === 'AGENT'
    });

    const canAdd = user?.role === 'AGENT';

    return (
        <>
            <PageMeta title="Farmers | Landify" description="Manage Farmers" />
            <div className="space-y-6">
                <UserTable
                    title={user?.role === 'AGENT' ? "My Farmers" : "Farmers List"}
                    users={farmers || []}
                    isLoading={isLoading}
                    addLabel={canAdd ? "Add Farmer" : undefined}
                    onAddClick={canAdd ? () => setShowModal(true) : undefined}
                    onAddLand={canAdd ? (farmer) => {
                        setSelectedFarmer(farmer);
                        setShowLandModal(true);
                    } : undefined}
                />
            </div>
            <AddFarmerModal isOpen={showModal} onClose={() => setShowModal(false)} />
            <AddLandModal
                isOpen={showLandModal}
                onClose={() => setShowLandModal(false)}
                farmer={selectedFarmer}
            />
        </>
    );
}
