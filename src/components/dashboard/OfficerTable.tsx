import { useState, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import {
    ChevronLeftIcon,
    UserIcon,
    PencilIcon,
    EyeIcon,
    TrashBinIcon,
} from "../../icons";


const AgentCountCell = () => {
    return (
        <div className="text-sm font-bold text-gray-400 dark:text-gray-500">
            -
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
    const columns: any[] = useMemo(() => {
        if (users.length === 0) return [];

        return [
            {
                id: "sno",
                header: "S.NO",
                minWidth: "60px",
                render: (_: User, idx: number) => (
                    <div className="flex items-center h-12">
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                            {(currentPage - 1) * itemsPerPage + idx + 1}
                        </span>
                    </div>
                )
            },
            {
                id: "name",
                header: "Field Officer",
                minWidth: "220px",
                render: (user: User) => (
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm relative group-hover:border-brand-300 transition-colors flex items-center justify-center">
                            {user.user_image_url ? (
                                <img
                                    src={user.user_image_url}
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <UserIcon className="size-6 text-gray-400 dark:text-gray-500" />
                            )}
                            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-2xl pointer-events-none"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900 dark:text-white text-sm tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                {user.first_name} {user.last_name}
                            </span>
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                                {user.phone_number}
                            </span>
                        </div>
                    </div>
                )
            },
            {
                id: "user_id",
                header: "FO ID",
                minWidth: "140px",
                render: (user: User) => (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md shadow-sm border border-gray-200/50 dark:border-gray-700 text-center">{format(user.unique_id)}</span>
                        </div>
                    </div>
                )
            },
            {
                id: "reference_id",
                header: "ADMIN ID",
                minWidth: "160px",
                render: (user: User) => (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/10 px-2 py-0.5 rounded-md shadow-sm border border-blue-200/50 dark:border-blue-700/50 text-center">{format(user.reference_id)}</span>
                        </div>
                    </div>
                )
            },
            {
                id: "mandal",
                header: "MANDAL",
                minWidth: "140px",
                render: (user: User) => (
                    <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-50 to-white border border-brand-100 shadow-sm dark:from-brand-900/20 dark:to-gray-800 dark:border-brand-800/50">
                        <span className="text-xs font-black text-brand-700 dark:text-brand-400 uppercase tracking-widest">
                            {format(user.mandal)}
                        </span>
                    </div>
                )
            },

            {
                id: "role",
                header: "ROLE",
                minWidth: "100px",
                render: (user: User) => (
                    <div className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-widest">{format(user.role)}</span>
                    </div>
                )
            },
            {
                id: "is_active",
                header: "STATUS",
                minWidth: "100px",
                render: (user: User) => (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border shadow-sm ${user.is_active !== false ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'}`}>
                        <div className={`size-1.5 rounded-full ${user.is_active !== false ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{user.is_active !== false ? 'ACTIVE' : 'INACTIVE'}</span>
                    </div>
                )
            },
            {
                id: "agents",
                header: "AGENTS",
                minWidth: "120px",
                render: (_: User) => (
                    <AgentCountCell />
                )
            },
            {
                id: "update",
                header: "UPDATE",
                minWidth: "100px",
                render: (user: User) => (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onView && onView(user); }}
                            className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-800"
                            title="View Details"
                        >
                            <EyeIcon className="size-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit && onEdit(user); }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-800"
                            title="Edit Officer"
                        >
                            <PencilIcon className="size-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete && onDelete(user); }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-800"
                            title="Delete Officer"
                        >
                            <TrashBinIcon className="size-4" />
                        </button>
                    </div>
                )
            },
        ];
    }, [users, currentPage]);

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
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-2xl shadow-gray-200/40 dark:shadow-none overflow-hidden mt-8">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700">
                            <TableRow>
                                {columns.map((col, idx) => (
                                    <TableCell key={col.id} isHeader className={`py-5 ${idx === 0 ? 'pl-8' : 'px-4'} text-[10px] font-black text-gray-400 uppercase tracking-widest text-left`}>
                                        <div style={{ minWidth: col.minWidth }}>{col.header}</div>
                                    </TableCell>
                                ))}
                                {/* <TableCell isHeader className="py-5 pr-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                                    <div className="min-w-[90px] flex justify-end">ACTIONS</div>
                                </TableCell> */}
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length + 1} className="text-center py-20 text-gray-400 font-medium">Loading officers data...</TableCell>
                                </TableRow>
                            ) : paginatedUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length + 1} className="text-center py-20 text-gray-400 font-medium">No officers found matching your search.</TableCell>
                                </TableRow>
                            ) : (
                                paginatedUsers.map((user, index) => {
                                    return (
                                        <TableRow
                                            key={index}
                                            className="hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-all duration-200 group cursor-pointer"
                                            onClick={() => onView && onView(user)}
                                        >
                                            {columns.map((col, colIdx) => (
                                                <TableCell key={col.id} className={`py-5 align-top ${colIdx === 0 ? 'pl-8' : 'px-4'}`}>
                                                    {col.render(user, index)}
                                                </TableCell>
                                            ))}
                                            {/* <TableCell className="py-5 pr-8 text-right align-top">
                                                <div className="min-w-[120px] flex items-center justify-end gap-2.5 transition-opacity ml-auto">
                                                    {onView && (
                                                        <button onClick={(e) => { e.stopPropagation(); onView(user); }} className="p-2 text-gray-400 hover:text-brand-600 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-800">
                                                            <EyeIcon className="size-4" />
                                                        </button>
                                                    )}
                                                    {onEdit && (
                                                        <button onClick={(e) => { e.stopPropagation(); onEdit(user); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-800">
                                                            <PencilIcon className="size-4" />
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button onClick={(e) => { e.stopPropagation(); onDelete(user); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-800">
                                                            <TrashBinIcon className="size-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </TableCell> */}
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-8 bg-gray-50/30 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-300 font-medium">
                        Showing <span className="text-gray-800 dark:text-white font-bold">{users.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="text-gray-800 dark:text-white font-bold">{Math.min(currentPage * itemsPerPage, users.length)}</span> of <span className="text-gray-800 dark:text-white font-bold">{users.length}</span> entries
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


        </div>
    );
}
