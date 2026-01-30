import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import { getDashboardStats } from "../../services/dashboardService";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

export default function EcommerceMetrics() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  if (isLoading) {
    return <div className="p-4 text-gray-500">Loading stats...</div>;
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">

      {/* Role Specific User Counts */}
      {user?.role === 'ADMIN' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <div className="mt-5">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Officers (AO)</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{stats.ao_count}</h4>
          </div>
        </div>
      )}

      {(user?.role === 'ADMIN' || user?.role === 'AGRICULTURE_OFFICER') && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <div className="mt-5">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Agents</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{stats.agent_count}</h4>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">Total Farmers</span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{stats.farmer_count}</h4>
        </div>
      </div>

      {/* Land Stats */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">Total Acres</span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{stats.lands_in_acres} ac</h4>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">Land Applications</span>
          <div className="flex flex-col gap-1 mt-2">
            <span className="text-xs text-secondary-500">Pending: {stats.pending_land_count}</span>
            <span className="text-xs text-green-500">Approved: {stats.approved_land_count}</span>
            <span className="text-xs text-red-500">Rejected: {stats.rejected_land_count}</span>
          </div>
        </div>
      </div>

      {/* Fodder Stats */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">Est. Fodder (Tons)</span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{stats.fodder_in_tons} tons</h4>
        </div>
      </div>

    </div>
  );
}
