
import { useState } from "react";
// import { useSelector } from "react-redux";
// import { RootState } from "../../store/store";
// import { useQuery } from "@tanstack/react-query";
// import { getAgents, getAOs, getFarmers } from "../../services/userService";
// import UserTable from "../../components/dashboard/UserTable";
import PageMeta from "../../components/common/PageMeta";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import AddOfficerModal from "../../components/dashboard/AddOfficerModal";
import AddAgentModal from "../../components/dashboard/AddAgentModal";
import AddFarmerModal from "../../components/dashboard/AddFarmerModal";

export default function Home() {
  // const { user } = useSelector((state: RootState) => state.auth);

  const [showOfficerModal, setShowOfficerModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showFarmerModal, setShowFarmerModal] = useState(false);

  // const { data: aos } = useQuery({ queryKey: ['aos'], queryFn: getAOs, enabled: user?.role === 'ADMIN' });
  // const { data: agents } = useQuery({ queryKey: ['agents'], queryFn: getAgents, enabled: user?.role === 'ADMIN' || user?.role === 'FIELD_OFFICER' });
  // const { data: farmers } = useQuery({ queryKey: ['farmers'], queryFn: getFarmers, enabled: user?.role === 'ADMIN' || user?.role === 'AGENT' || user?.role === 'FIELD_OFFICER' });

  return (
    <>
      <PageMeta
        title="Landify Dashboard"
        description="Landify Dashboard for Agricultural Management"
      />

      <div className="space-y-6">
        <EcommerceMetrics />
      </div>

      {/* MODALS */}
      <AddOfficerModal isOpen={showOfficerModal} onClose={() => setShowOfficerModal(false)} />
      <AddAgentModal isOpen={showAgentModal} onClose={() => setShowAgentModal(false)} />
      <AddFarmerModal isOpen={showFarmerModal} onClose={() => setShowFarmerModal(false)} />
    </>
  );
}
