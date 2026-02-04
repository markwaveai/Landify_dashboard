import { useState } from "react";
import { useNavigate } from "react-router";
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

    const navigate = useNavigate();
    const [modalStep, setModalStep] = useState(1);

    const { data: farmers, isLoading } = useQuery({
        queryKey: ['farmers'],
        queryFn: getFarmers,
        enabled: user?.role === 'ADMIN' || user?.role === 'AGRICULTURE_OFFICER' || user?.role === 'AGENT'
    });

    const canAdd = user?.role === 'AGENT';

    const handleRowClick = (farmer: any) => {
        if (farmer.is_step1_completed && farmer.is_step2_completed && farmer.is_step3_completed) {
            navigate(`/farmers/${farmer.phone_number}`);
        } else if (farmer.is_step1_completed && farmer.is_step2_completed && !farmer.is_step3_completed) {
            setSelectedFarmer(farmer);
            setModalStep(3);
            setShowModal(true);
        } else if (farmer.is_step1_completed && !farmer.is_step2_completed) {
            setSelectedFarmer(farmer);
            setModalStep(2);
            setShowModal(true);
        } else {
            // Default to Step 1 or generic edit if needed
            setSelectedFarmer(farmer);
            setModalStep(1);
            setShowModal(true);
        }
    };

    return (
        <>
            <PageMeta title="Farmers | Landify" description="Manage Farmers" />
            <div className="space-y-6">
                <UserTable
                    title={user?.role === 'AGENT' ? "My Farmers" : "Farmers List"}
                    users={farmers || []}
                    isLoading={isLoading}
                    addLabel={canAdd ? "Add Farmer" : undefined}
                    onAddClick={canAdd ? () => {
                        setSelectedFarmer(null);
                        setModalStep(1);
                        setShowModal(true);
                    } : undefined}

                    onRowClick={handleRowClick}
                />
            </div>
            <AddFarmerModal
                key={selectedFarmer?.unique_id || 'new'}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                initialStep={modalStep}
                initialData={selectedFarmer}
            />
            <AddLandModal
                isOpen={showLandModal}
                onClose={() => setShowLandModal(false)}
                farmer={selectedFarmer}
            />
        </>
    );
}
