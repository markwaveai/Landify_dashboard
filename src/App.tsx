import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";

import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import AosPage from "./pages/Dashboard/AosPage";
import AgentsPage from "./pages/Dashboard/AgentsPage";
import AgentDetailsPage from "./pages/Dashboard/AgentDetailsPage";
import OfficerDetailsPage from "./pages/Dashboard/OfficerDetailsPage";
// import FarmersPage from "./pages/Dashboard/FarmersPage";
import ApprovalsPage from "./pages/Dashboard/ApprovalsPage";
// import FarmerDetailsPage from "./pages/Dashboard/FarmerDetailsPage";
import UserProfile from "./pages/Dashboard/UserProfile";
import LandApprovalDetailsPage from "./pages/Dashboard/LandApprovalDetailsPage";
import FodderProcurementPage from "./pages/Dashboard/FodderProcurementPage";
// import PaymentsPage from "./pages/Dashboard/PaymentsPage";
// import CultivationPage from "./pages/Dashboard/CultivationPage";
import LegalPage from "./pages/OtherPage/LegalPage";
import SupportPage from "./pages/OtherPage/SupportPage";
import DeleteAccountPage from "./pages/OtherPage/DeleteAccountPage";

import { SnackbarProvider } from "./context/SnackbarContext";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { Navigate } from "react-router";

const ConditionalLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? <AppLayout>{children}</AppLayout> : <>{children}</>;
};

export default function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <>
      <SnackbarProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Dashboard Layout */}
            <Route element={isAuthenticated ? <AppLayout /> : <Navigate to="/signin" replace />}>
              <Route index element={<Home />} />
              <Route path="/aos" element={<AosPage />} />
              <Route path="/aos/:phoneNumber" element={<OfficerDetailsPage />} />
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/agents/:phoneNumber" element={<AgentDetailsPage />} />
              {/* <Route path="/farmers" element={<FarmersPage />} /> */}
              {/* <Route path="/farmers/:phoneNumber" element={<FarmerDetailsPage />} /> */}
              <Route path="/approvals" element={<ApprovalsPage />} />
              {/* <Route path="/payments" element={<PaymentsPage />} /> */}
              {/* <Route path="/cultivation" element={<CultivationPage />} /> */}
              <Route path="/profile" element={<UserProfile />} />

              <Route path="/fodder-procurement" element={<FodderProcurementPage />} />
              <Route path="/fodder" element={<FodderProcurementPage />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blank" element={<Blank />} />
              <Route path="/land-approvals/:id" element={<LandApprovalDetailsPage />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />

              {/* Charts */}
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
            </Route>

            {/* Public but Dashboard-aware Routes */}
            <Route path="/legal" element={<ConditionalLayout><LegalPage /></ConditionalLayout>} />
            <Route path="/support" element={<ConditionalLayout><SupportPage /></ConditionalLayout>} />
            <Route path="/delete-account" element={<ConditionalLayout><DeleteAccountPage /></ConditionalLayout>} />

            {/* Auth Layout */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </SnackbarProvider>
    </>
  );
}
