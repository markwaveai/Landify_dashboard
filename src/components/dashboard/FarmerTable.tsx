import { useState, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import { useNavigate } from "react-router";
import Badge from "../ui/badge/Badge";
import { ChevronLeftIcon, UserIcon } from "../../icons";

const format = (val: any) => (val === undefined || val === null || val === "" || val === 0) ? "-" : val;

interface Farmer {
    first_name: string;
    last_name: string;
    phone_number: string;
    role: string;
    unique_id?: string;
    email?: string;
    village?: string;
    mandal?: string;
    district?: string;
    state?: string;
    pincode?: string;
    city?: string;
    address?: string;
    date_of_birth?: string;
    gender?: string;
    is_active?: boolean;
    otp_verified?: boolean;

    // Extra Details
    aadhar_card_number?: string;
    pan_number?: string;
    bank_name?: string;
    account_number?: string;
    ifsc_code?: string;
    bank_branch?: string;
    alternate_phone_number?: string;
    reference_id?: string;

    // Image/Doc URLs
    user_image_url?: string;
    aadhar_image_url?: string;
    pan_image_url?: string;
    bank_passbook_image_url?: string;
    agreement_url?: string;

    status?: string; // e.g. "Pending Step 1"
    land_count?: number;
    total_acres?: number | string;
    bond_duration?: string;
    payment_status?: 'Paid' | 'Pending';
}

interface FarmerTableProps {
    title?: string;
    users: Farmer[];
    onRowClick?: (farmer: Farmer) => void;
    isLoading?: boolean;
    currentPage?: number;
    onPageChange?: (page: number) => void;
}
const ITEMS_PER_PAGE = 5;

const LandCountCell = ({ initialCount }: { initialCount?: number }) => {
    const count = initialCount || 0;
    return (
        <div className="flex items-center">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
                {count} {count === 1 ? 'Land' : 'Lands'}
            </span>
        </div>
    );
};

export default function FarmerTable({ title, users, onRowClick, isLoading, currentPage: propsPage, onPageChange: propsOnPageChange }: FarmerTableProps) {
    const navigate = useNavigate();
    const [localPage, setLocalPage] = useState(1);

    const currentPage = propsPage !== undefined ? propsPage : localPage;
    const setCurrentPage = propsOnPageChange !== undefined ? propsOnPageChange : setLocalPage;

    // Dynamic columns logic
    const columns = useMemo(() => {
        if (!users || users.length === 0) return [];

        const hasData = (key: keyof Farmer) => users.some(u => u[key] !== undefined && u[key] !== null && u[key] !== "");

        const allPossibleColumns = [
            {
                id: "sno",
                header: "S.NO",
                minWidth: "60px",
                align: "center",
                show: true,
                render: (_: Farmer, idx: number) => (
                    <div className="flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                            {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                        </span>
                    </div>
                )
            },
            {
                id: "name",
                header: "FARMER NAME",
                minWidth: "200px",
                align: "center",
                show: true,
                render: (user: Farmer) => (
                    <div className="flex items-center justify-start gap-1.5 pl-8">
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
                        <div className="flex flex-col text-left">
                            <span className="font-bold text-gray-900 dark:text-white text-sm tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors uppercase whitespace-nowrap">
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
                id: "unique_id",
                header: "USER ID",
                minWidth: "120px",
                align: "center",
                show: hasData("unique_id"),
                render: (user: Farmer) => (
                    <div className="flex items-center justify-center">
                        <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">
                            {format(user.unique_id)}
                        </span>
                    </div>
                )
            },
            {
                id: "reference_id",
                header: "REFERENCE ID",
                minWidth: "120px",
                align: "center",
                show: hasData("reference_id"),
                render: (user: Farmer) => (
                    <div className="flex items-center justify-center">
                        <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">
                            {format(user.reference_id)}
                        </span>
                    </div>
                )
            },
            {
                id: "land",
                header: "LAND",
                minWidth: "120px",
                align: "center",
                show: true,
                render: (user: Farmer) => (
                    <div className="flex justify-center">
                        <LandCountCell
                            initialCount={user.land_count}
                        />
                    </div>
                )
            },


            {
                id: "otp_verified",
                header: "VERIFIED",
                minWidth: "120px",
                align: "center",
                show: true,
                render: (user: Farmer) => (
                    <div className="flex justify-center">
                        {user.otp_verified ? (
                            <Badge size="sm" color="info">VERIFIED</Badge>
                        ) : (
                            <Badge size="sm" color="warning">PENDING</Badge>
                        )}
                    </div>
                )
            },
            {
                id: "status",
                header: "STATUS",
                minWidth: "140px",
                align: "center",
                show: true,
                render: (user: Farmer) => {
                    const isActive = user.is_active !== false && (!user.status || !user.status.toLowerCase().includes('pending'));
                    return (
                        <div className="flex justify-center">
                            <div className="inline-flex items-center gap-1.5">
                                <div className={`size-1.5 rounded-full ${isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'}`}></div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                    {user.status || (isActive ? 'ACTIVE' : 'PENDING')}
                                </span>
                            </div>
                        </div>
                    );
                }
            }
        ];

        return allPossibleColumns.filter(col => col.show);
    }, [users, currentPage]);

    // Calculate pagination values
    const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentUsers = users.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="space-y-6 font-outfit">
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {title}
                    </h3>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-2xl shadow-gray-200/40 dark:shadow-none overflow-hidden mt-8">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700">
                            <TableRow>
                                {columns.map((col, idx) => (
                                    <TableCell key={col.id} isHeader className={`py-5 ${idx === 0 ? 'pl-8' : 'px-4'} text-[10px] font-black text-gray-400 uppercase tracking-widest ${col.align === 'center' ? 'text-center' : 'text-left'}`}>
                                        <div style={{ minWidth: col.minWidth }}>{col.header}</div>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {isLoading ? (
                                <TableRow>
                                    <TableCell className="py-8 text-center text-gray-500" colSpan={columns.length}>
                                        Loading farmers...
                                    </TableCell>
                                </TableRow>
                            ) : currentUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell className="py-8 text-center text-gray-500" colSpan={columns.length}>
                                        No farmers found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentUsers.map((user, index) => (
                                    <TableRow
                                        key={index}
                                        className="hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-all duration-200 group cursor-pointer"
                                        onClick={() => onRowClick ? onRowClick(user) : navigate(`/farmers/${user.unique_id}`)}
                                    >
                                        {columns.map((col, colIdx) => (
                                            <TableCell key={col.id} className={`py-5 align-top ${colIdx === 0 ? 'pl-8' : 'px-4'} ${col.align === 'center' ? 'text-center' : ''}`}>
                                                {col.render(user, index)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-8 bg-gray-50/30 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-300 font-medium">
                        Showing <span className="text-gray-800 dark:text-white font-bold">{users.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="text-gray-800 dark:text-white font-bold">{Math.min(currentPage * ITEMS_PER_PAGE, users.length)}</span> of <span className="text-gray-800 dark:text-white font-bold">{users.length}</span> entries
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
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
                                    onClick={() => typeof page === 'number' && handlePageChange(page)}
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
                            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <ChevronLeftIcon className="w-4 h-4 rotate-180" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
