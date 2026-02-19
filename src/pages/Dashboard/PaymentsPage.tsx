
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    RupeeLineIcon,
    TimeIcon,
    BoxIcon,
    FileIcon,
    DownloadIcon,
    PlusIcon,
    ChevronLeftIcon,
} from "../../icons";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import {
    HorizontaLDots,
    ListIcon,
    CalendarIcon
} from "../../icons";
import { getPaymentStats, getPaymentLedger } from "../../services/paymentService";

const SearchIcon = () => (
    <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

// Interfaces for UI state transformation
interface PaymentUiStat {
    title: string;
    value: string;
    subValue?: string;
    trend?: string;
    trendType?: 'positive' | 'negative' | 'neutral';
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
}

const PaymentsPage: React.FC = () => {
    const [page, setPage] = useState(1);

    // Fetch stats
    const { data: statsData, isLoading: isLoadingStats } = useQuery({
        queryKey: ['payment-stats'],
        queryFn: getPaymentStats,
    });

    // Fetch ledger
    const { data: ledgerData, isLoading: isLoadingLedger } = useQuery({
        queryKey: ['payment-ledger', page],
        queryFn: () => getPaymentLedger(page),
    });

    // Transform API data to UI format
    const stats: PaymentUiStat[] = [
        {
            title: "Total Payouts",
            value: statsData ? `₹${statsData.total_payouts.toLocaleString()}` : "Loading...",
            trend: "+12%",
            trendType: "positive",
            icon: RupeeLineIcon,
            colorClass: "bg-green-100 text-green-600",
        },
        {
            title: "Pending Approvals",
            value: statsData ? `₹${statsData.pending_approvals.toLocaleString()}` : "Loading...",
            trend: "Pending",
            trendType: "neutral",
            icon: TimeIcon,
            colorClass: "bg-orange-100 text-orange-600",
        },
        {
            title: "Total Harvest (Tons)",
            value: statsData ? `452.8 t` : "Loading...", // In real app would come from statsData
            icon: BoxIcon,
            colorClass: "bg-blue-100 text-blue-600",
        },
    ];

    return (
        <div className="p-2 md:p-4 space-y-6 font-outfit text-gray-800 dark:text-white">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <nav className="flex text-sm text-gray-500 mb-1">
                        <span className="hover:text-gray-700 cursor-pointer">Admin</span>
                        <span className="mx-2">/</span>
                        <span className="text-gray-700 font-medium">Financial Management</span>
                    </nav>
                    <h1 className="text-2xl font-bold">Payments & Business Reports</h1>
                </div>
                <div className="relative w-full md:w-auto">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            className="bg-gray-100 dark:bg-gray-800 border-none rounded-lg py-2 px-4 pl-10 w-full md:w-64 text-sm focus:ring-2 focus:ring-green-500 transition-all outline-none"
                        />
                        <SearchIcon />
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.colorClass} bg-opacity-20`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            {stat.trend && (
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                    ${stat.trendType === 'positive' ? 'bg-green-100 text-green-700' :
                                        stat.trendType === 'neutral' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                    {stat.trend}
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.title}</p>
                            <h3 className={`text-2xl font-bold mt-1 text-gray-900 dark:text-white ${isLoadingStats ? 'animate-pulse bg-gray-200 h-8 w-24 rounded' : ''}`}>
                                {!isLoadingStats ? stat.value : ''}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Payment Ledger */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-lg font-bold">Recent Payment Ledger</h2>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white transition-colors">
                            <ListIcon className="w-4 h-4" /> Filter
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
                            <PlusIcon className="w-4 h-4 text-white" /> New Payment
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-800/50 uppercase text-xs font-semibold text-gray-500">
                            <TableRow>
                                <TableCell isHeader className="py-4 pl-6 text-left">Farmer Name</TableCell>
                                <TableCell isHeader className="text-left px-4">Quantity (Tons)</TableCell>
                                <TableCell isHeader className="text-left px-4">Amount (₹)</TableCell>
                                <TableCell isHeader className="text-left px-4">Status</TableCell>
                                <TableCell isHeader className="text-right pr-6">Actions</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingLedger ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="py-4 pl-6 text-left"><div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div></TableCell>
                                        <TableCell className="text-left px-4"><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></TableCell>
                                        <TableCell className="text-left px-4"><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></TableCell>
                                        <TableCell className="text-left px-4"><div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div></TableCell>
                                        <TableCell className="text-right pr-6"><div className="h-8 bg-gray-200 rounded w-24 ml-auto animate-pulse"></div></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                ledgerData?.data.map((payment) => (
                                    <TableRow key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <TableCell className="py-4 pl-6 text-left">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={payment.farmer_avatar || `https://ui-avatars.com/api/?name=${payment.farmer_name}`}
                                                    alt={payment.farmer_name}
                                                    className="w-10 h-10 rounded-full bg-gray-100 object-cover border border-gray-100"
                                                />
                                                <span className="font-semibold text-gray-900 dark:text-white">{payment.farmer_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-gray-700 dark:text-gray-300 px-4 text-left">{payment.quantity_tons}</TableCell>
                                        <TableCell className="font-bold text-green-700 px-4 text-left">₹{payment.amount.toLocaleString()}</TableCell>
                                        <TableCell className="px-4 text-left">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                                ${payment.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-green-100 text-green-700'}`}>
                                                {payment.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            {payment.status === 'Pending' ? (
                                                <button className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg shadow-sm transition-colors opacity-90 hover:opacity-100">
                                                    Confirm Payment
                                                </button>
                                            ) : (
                                                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100">
                                                    <HorizontaLDots className="w-5 h-5" />
                                                </button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500">
                    <p>Showing {ledgerData?.data.length || 0} of {ledgerData?.total || 0} transactions</p>
                    <div className="flex gap-2">
                        <button
                            className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-50 disabled:opacity-50"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center border border-green-600 bg-green-600 text-white rounded font-bold">{page}</button>
                        <button
                            className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-50 disabled:opacity-50"
                            onClick={() => setPage(p => p + 1)}
                            disabled={!ledgerData || page * 10 >= ledgerData.total}
                        >
                            <ChevronLeftIcon className="w-4 h-4 rotate-180" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Business Reports Center */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Business Reports Center</h2>
                    <button className="flex items-center gap-2 text-sm text-gray-600 bg-white border px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                        <CalendarIcon className="w-4 h-4" /> This Month (Oct 2023) <ChevronLeftIcon className="w-3 h-3 rotate-270" />
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Report Card 1 */}
                    <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-100 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[180px] group hover:border-green-200 transition-colors">
                        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform group-hover:scale-110 transition-transform duration-500">
                            <BoxIcon className="w-48 h-48 text-green-800" />
                        </div>
                        <div className="flex justify-between items-start">
                            <div className="max-w-[70%]">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Agent Performance Report</h3>
                                <p className="text-sm text-gray-600 mt-2">Efficiency, recruitment, and harvest tracking for field agents.</p>
                            </div>
                            <div className="bg-white p-2 rounded-xl shadow-sm">
                                <FileIcon className="w-6 h-6 text-green-700" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6 z-10">
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors shadow-sm">
                                <DownloadIcon className="w-4 h-4 text-white" /> Download PDF
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border hover:bg-gray-50 transition-colors">
                                <FileIcon className="w-4 h-4 text-green-700" /> CSV Export
                            </button>
                        </div>
                    </div>

                    {/* Report Card 2 */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 p-6 rounded-2xl relative flex flex-col justify-between min-h-[180px] hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div className="max-w-[70%]">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Financial Summary</h3>
                                <p className="text-sm text-gray-600 mt-2">Consolidated payout history, taxes, and pending liabilities.</p>
                            </div>
                            <div className="bg-green-50 p-2 rounded-xl">
                                <FileIcon className="w-6 h-6 text-green-700" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors shadow-sm">
                                <DownloadIcon className="w-4 h-4 text-white" /> Download PDF
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border hover:bg-gray-50 transition-colors">
                                <FileIcon className="w-4 h-4 text-green-700" /> CSV Export
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentsPage;
