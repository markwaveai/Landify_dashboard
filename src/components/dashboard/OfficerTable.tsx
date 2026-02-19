import { useState, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import {
    PencilIcon,
    TrashBinIcon,
    ChevronLeftIcon,
    EyeIcon,
    UserCircleIcon,
    TractorIcon,
    GridIcon,
    UserIcon,
} from "../../icons";
import { useQuery } from "@tanstack/react-query";
import { getAgentFarmers } from "../../services/userService";

const AgentCountCell = ({ officerId }: { officerId: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { data: agents, isLoading } = useQuery({
        queryKey: ['officer-agents', officerId],
        queryFn: () => getAgentFarmers(officerId),
        enabled: !!officerId
    });

    if (isLoading) return (
        <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-gray-200 animate-pulse"></div>
            <span className="text-xs text-gray-400 italic">loading...</span>
        </div>
    );

    const count = agents?.filter((u: any) => u.role === 'AGENT')?.length || 0;

    if (count === 0) return (
        <div className="text-sm text-gray-400 font-medium italic">
            {count} Agents
        </div>
    );

    return (
        <div className="flex flex-col gap-2">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                }}
                className="flex items-center gap-2 group/btn"
            >
                <div className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all ${isExpanded ? 'bg-brand-600 text-white shadow-sm' : 'bg-brand-50 text-brand-700 group-hover/btn:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-400'}`}>
                    {count} {count === 1 ? 'Agent' : 'Agents'}
                </div>
                <ChevronLeftIcon className={`size-3 transition-transform text-gray-400 ${isExpanded ? 'rotate-[-90deg]' : 'rotate-[-180deg]'}`} />
            </button>

            {isExpanded && (
                <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-gray-100 dark:border-gray-800 p-2.5 space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar w-[180px] shadow-inner" onClick={e => e.stopPropagation()}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200/50 dark:border-gray-700/50 pb-1.5 mb-2 tracking-widest">AGENT IDS</p>
                    <div className="space-y-1.5">
                        {agents?.filter((u: any) => u.role === 'AGENT').map((agent: any) => (
                            <div key={agent.unique_id} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:border-brand-200 dark:hover:border-brand-800">
                                <span className="text-[10px] font-mono font-bold text-gray-600 dark:text-gray-300">
                                    {agent.unique_id || "No ID"}
                                </span>
                                <div className="size-1.5 rounded-full bg-green-500"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


interface User {
    first_name: string;
    last_name: string;
    phone_number: string;
    role: string;
    unique_id?: string;
    email?: string;
    district?: string;
    village?: string;
    mandal?: string;
    state?: string;
    pincode?: string;
    date_of_birth?: string;
    gender?: string;
    is_active?: boolean;
    otp_verified?: boolean;
    // Land Status
    active_lands?: number;
    harvest_ready?: number;
    remarks_lands?: number;
    rejected_lands?: number;
    approved_lands?: number;
    review_lands?: number;
    // Details & Bank
    reference_id?: string;
    aadhar_card_number?: string;
    pan_number?: string;
    alternate_phone_number?: string;
    account_number?: string;
    bank_name?: string;
    ifsc_code?: string;
    bank_branch?: string;
    // Verification
    user_image_url?: string;
    aadhar_image_url?: string;
    pan_image_url?: string;
    bank_passbook_image_url?: string;
    agreement_url?: string;
    address?: string;
}

interface OfficerTableProps {
    users: User[];
    isLoading?: boolean;
    onEdit?: (user: User) => void;
    onDelete?: (user: User) => void;
    onView?: (user: User) => void;
}

export default function OfficerTable({
    users,
    isLoading,
    onEdit,
    onDelete,
    onView,
}: OfficerTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Helper for null display
    const format = (val: any) => (val === undefined || val === null || val === "" || val === 0) ? "-" : val;

    // Dynamic columns logic
    const columns = useMemo(() => {
        if (users.length === 0) return [];

        return [
            {
                id: "name",
                header: "NAME",
                minWidth: "180px",
                render: (user: User) => (
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-600">
                            <img
                                src={user.user_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.phone_number}`}
                                alt="avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                {user.first_name} {user.last_name}
                            </div>
                        </div>
                    </div>
                )
            },
            {
                id: "user_id",
                header: "USER ID",
                minWidth: "120px",
                render: (user: User) => (
                    <div className="text-[11px] font-mono font-bold text-gray-600 dark:text-gray-400">
                        {format(user.unique_id)}
                    </div>
                )
            },
            {
                id: "mandal",
                header: "MANDAL",
                minWidth: "120px",
                render: (user: User) => (
                    <div className="text-sm font-bold text-brand-600 dark:text-brand-400 uppercase tracking-tight">
                        {format(user.mandal)}
                    </div>
                )
            },
            {
                id: "ref_id",
                header: "REF ID",
                minWidth: "120px",
                render: (user: User) => (
                    <div className="text-[11px] font-mono font-bold text-brand-600">
                        {format(user.reference_id)}
                    </div>
                )
            },
            {
                id: "address_group",
                header: "ADDRESS",
                minWidth: "180px",
                render: (user: User) => (
                    <div className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
                        <p className="font-bold text-gray-800 dark:text-gray-200">{format(user.village)}</p>
                        <p>{format(user.district)}</p>
                        <p>{format(user.state)} - {format(user.pincode)}</p>
                    </div>
                )
            },
            {
                id: "land_status",
                header: "LAND STATUS",
                minWidth: "220px",
                render: (user: User) => (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-medium">
                        <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-0.5">
                            <span className="text-gray-400">ACTIVE:</span>
                            <span className="text-green-600 font-bold">{format(user.active_lands)}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-0.5">
                            <span className="text-gray-400">HARVEST:</span>
                            <span className="text-blue-600 font-bold">{format(user.harvest_ready)}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-0.5">
                            <span className="text-gray-400">REMARKS:</span>
                            <span className="text-yellow-600 font-bold">{format(user.remarks_lands)}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-0.5">
                            <span className="text-gray-400">REJECTED:</span>
                            <span className="text-red-600 font-bold">{format(user.rejected_lands)}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-0.5">
                            <span className="text-gray-400">APPROVED:</span>
                            <span className="text-green-600 font-bold">{format(user.approved_lands)}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-0.5">
                            <span className="text-gray-400">REVIEW:</span>
                            <span className="text-purple-600 font-bold">{format(user.review_lands)}</span>
                        </div>
                    </div>
                )
            },
            {
                id: "details",
                header: "DETAILS",
                minWidth: "180px",
                render: (user: User) => (
                    <div className="text-[11px] space-y-0.5 text-gray-600 dark:text-gray-400">
                        <p><span className="text-gray-400 font-bold">AADHAR:</span> {format(user.aadhar_card_number)}</p>
                        <p><span className="text-gray-400 font-bold">PAN:</span> {format(user.pan_number)}</p>
                        <p><span className="text-gray-400 font-bold">ALT:</span> {format(user.alternate_phone_number)}</p>
                    </div>
                )
            },
            {
                id: "bank_details",
                header: "BANK DETAILS",
                minWidth: "180px",
                render: (user: User) => (
                    <div className="text-[11px] space-y-0.5 text-gray-600 dark:text-gray-400">
                        <p className="font-bold text-gray-800 dark:text-gray-200">{format(user.account_number)}</p>
                        <p>{format(user.bank_name)}</p>
                        <p>{format(user.ifsc_code)}</p>
                        <p className="text-[10px] italic">{format(user.bank_branch)}</p>
                    </div>
                )
            },
            {
                id: "verification",
                header: "VERIFICATION",
                minWidth: "180px",
                render: (user: User) => {
                    const docs = [
                        { label: "USER", url: user.user_image_url },
                        { label: "AADHAR", url: user.aadhar_image_url },
                        { label: "PAN", url: user.pan_image_url },
                        { label: "BANK", url: user.bank_passbook_image_url },
                        { label: "AGREEMENT", url: user.agreement_url },
                    ];
                    return (
                        <div className="flex flex-wrap gap-1.5">
                            {docs.map((doc, i) => (
                                doc.url ? (
                                    <a
                                        key={i}
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[9px] font-bold px-1.5 py-0.5 bg-brand-50 text-brand-700 rounded border border-brand-100 hover:bg-brand-100 transition-colors"
                                    >
                                        {doc.label}
                                    </a>
                                ) : (
                                    <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded border border-gray-100">
                                        {doc.label}
                                    </span>
                                )
                            ))}
                        </div>
                    );
                }
            },
            {
                id: "agents",
                header: "AGENTS",
                minWidth: "120px",
                render: (user: User) => (
                    <AgentCountCell officerId={user.unique_id || user.phone_number} />
                )
            },
        ];
    }, [users]);

    // Filter users based on search
    const filteredUsers = useMemo(() => {
        return users.filter((user) =>
            `${user.first_name} ${user.last_name} ${user.mandal || ""} ${user.phone_number || ""} ${user.unique_id || ""}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const SearchIcon = () => (
        <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    );

    return (
        <div className="space-y-6 font-outfit">

            {/* Top Controls & Widgets Row */}
            <div className="flex flex-col xl:flex-row gap-6">
                {/* Search Bar */}
                <div className="flex-1 min-w-0">
                    <div className="relative w-full max-w-md">
                        <SearchIcon />
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
                            placeholder="Search by name or mandal..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Stats Widgets */}
                <div className="flex flex-wrap gap-4 justify-start xl:justify-end">
                    <div className="bg-white dark:bg-gray-800 px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4 min-w-[160px] flex-1 sm:flex-none">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">TOTAL OFFICERS</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{users.length}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4 min-w-[160px] flex-1 sm:flex-none">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">ACTIVE STATUS</p>
                            <p className="text-2xl font-bold text-green-500">{users.filter(u => u.is_active !== false).length}</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
                            <TableRow>
                                {columns.map((col, idx) => (
                                    <TableCell key={col.id} isHeader className={`py-4 ${idx === 0 ? 'pl-6' : 'px-4'} text-xs font-bold text-gray-400 uppercase tracking-wider text-left`}>
                                        <div style={{ minWidth: col.minWidth }}>{col.header}</div>
                                    </TableCell>
                                ))}
                                <TableCell isHeader className="py-4 pr-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
                                    <div className="min-w-[90px] flex justify-end">ACTIONS</div>
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length + 1} className="text-center py-10 text-gray-400">Loading officers data...</TableCell>
                                </TableRow>
                            ) : paginatedUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length + 1} className="text-center py-10 text-gray-400">No officers found matching your search.</TableCell>
                                </TableRow>
                            ) : (
                                paginatedUsers.map((user, index) => {
                                    return (
                                        <TableRow
                                            key={index}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/25 transition-colors group cursor-pointer"
                                            onClick={() => onView && onView(user)}
                                        >
                                            {columns.map((col, colIdx) => (
                                                <TableCell key={col.id} className={`py-4 ${colIdx === 0 ? 'pl-6' : 'px-4'}`}>
                                                    {col.render(user)}
                                                </TableCell>
                                            ))}
                                            <TableCell className="py-4 pr-6 text-right">
                                                <div className="min-w-[100px] flex items-center justify-end gap-2 transition-opacity ml-auto">
                                                    {onView && (
                                                        <button onClick={(e) => { e.stopPropagation(); onView(user); }} className="p-1.5 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-all">
                                                            <EyeIcon className="size-4" />
                                                        </button>
                                                    )}
                                                    {onEdit && (
                                                        <button onClick={(e) => { e.stopPropagation(); onEdit(user); }} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                                                            <PencilIcon className="size-4" />
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button onClick={(e) => { e.stopPropagation(); onDelete(user); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                            <TrashBinIcon className="size-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <p className="text-xs text-gray-500 font-medium">
                        Showing <span className="text-gray-800 dark:text-white font-bold">{filteredUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="text-gray-800 dark:text-white font-bold">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of <span className="text-gray-800 dark:text-white font-bold">{filteredUsers.length}</span> entries
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                        </button>

                        {(() => {
                            const pages = [];
                            if (totalPages <= 7) {
                                for (let i = 1; i <= totalPages; i++) pages.push(i);
                            } else {
                                pages.push(1);
                                if (currentPage > 3) pages.push("...");
                                const start = Math.max(2, currentPage - 1);
                                const end = Math.min(totalPages - 1, currentPage + 1);
                                for (let i = start; i <= end; i++) {
                                    if (!pages.includes(i)) pages.push(i);
                                }
                                if (currentPage < totalPages - 2) pages.push("...");
                                pages.push(totalPages);
                            }
                            return pages.map((page, index) => (
                                <button
                                    key={index}
                                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
                                    disabled={typeof page !== 'number'}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all shadow-sm ${currentPage === page
                                        ? 'bg-brand-600 text-white border border-brand-600'
                                        : typeof page === 'number'
                                            ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-50'
                                            : 'bg-transparent text-gray-400 border-transparent cursor-default'
                                        }`}
                                >
                                    {page}
                                </button>
                            ));
                        })()}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <ChevronLeftIcon className="w-4 h-4 rotate-180" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Widgets Row - Auto-Cycling Field Officer Data */}
            {(() => {
                const [activeIdx, setActiveIdx] = useState(0);

                useMemo(() => {
                    if (users.length === 0) return;
                    const timer = setInterval(() => {
                        setActiveIdx((prev) => (prev + 1) % users.length);
                    }, 5000); // Cycle every 5 seconds
                    return () => clearInterval(timer);
                }, [users.length]);

                const officer = users[activeIdx];
                if (!officer) return null;

                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
                        {/* Box 1: Basic Profile */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl group hover:border-brand-200 transition-all shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-5">
                                <UserCircleIcon className="size-20" />
                            </div>
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">BASIC PROFILE</span>
                                <div className="h-12 w-12 rounded-full bg-brand-50 dark:bg-brand-900/20 overflow-hidden border-2 border-white dark:border-gray-700 shadow-md">
                                    <img
                                        src={officer.user_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${officer.phone_number}`}
                                        alt="avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">{officer.first_name} {officer.last_name}</h3>
                            <p className="text-brand-600 dark:text-brand-400 text-sm font-black uppercase mt-1">{officer.unique_id}</p>
                            <div className="mt-4 flex gap-2">
                                <div className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] font-bold rounded uppercase">Active</div>
                                <div className="px-2 py-1 bg-gray-50 dark:bg-gray-700 text-gray-400 text-[10px] font-bold rounded uppercase">Verified</div>
                            </div>
                        </div>

                        {/* Box 2: Land Performance */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl group hover:border-brand-200 transition-all shadow-sm">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-4">LAND PERFORMANCE</span>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Active Lands</p>
                                    <p className="text-xl font-bold text-green-600">{format(officer.active_lands)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Approved</p>
                                    <p className="text-xl font-bold text-blue-600">{format(officer.approved_lands)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">In Review</p>
                                    <p className="text-xl font-bold text-purple-600">{format(officer.review_lands)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Rejected</p>
                                    <p className="text-xl font-bold text-red-600">{format(officer.rejected_lands)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Box 3: Location Details */}
                        <div className="bg-[#154732] border border-[#1a553c] p-6 rounded-2xl group transition-all shadow-lg text-white relative">
                            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-4">LOCATION DETAILS</span>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-lg"><TractorIcon className="size-4 text-green-300" /></div>
                                    <div>
                                        <p className="text-[9px] font-bold text-white/40 uppercase">Mandal</p>
                                        <p className="text-sm font-bold">{format(officer.mandal)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-lg"><GridIcon className="size-4 text-green-300" /></div>
                                    <div>
                                        <p className="text-[9px] font-bold text-white/40 uppercase">District</p>
                                        <p className="text-sm font-bold">{format(officer.district)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-lg"><UserIcon className="size-4 text-green-300" /></div>
                                    <div>
                                        <p className="text-[9px] font-bold text-white/40 uppercase">State</p>
                                        <p className="text-sm font-bold">{format(officer.state)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

        </div>
    );
}
