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
import Button from "../ui/button/Button";
import { ChevronLeftIcon, UserIcon } from "../../icons";

const format = (val: any) => (val === undefined || val === null || val === "" || val === 0) ? "-" : val;

const FarmerCountCell = ({ count }: { count?: number }) => {
    return (
        <div className="text-sm font-bold text-gray-500 dark:text-gray-400">
            {format(count)}
        </div>
    );
};

interface Agent {
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
    farmer_count?: number;
    land_count?: number;

    // Extra Details from userService
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

    // Enriched fields from Page
    assigned_officer_name?: string;
    status_label?: 'ACTIVE' | 'INACTIVE';
}

interface AgentTableProps {
    title: string;
    users: Agent[];
    onAddClick?: () => void;
    onRowClick?: (agent: Agent) => void;
    addLabel?: string;
    isLoading?: boolean;
}

const ITEMS_PER_PAGE = 5;



export default function AgentTable({ title, users, onAddClick, onRowClick, addLabel, isLoading }: AgentTableProps) {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);

    // Dynamic columns logic
    const columns = useMemo(() => {
        if (!users || users.length === 0) return [];

        const hasData = (key: keyof Agent) => users.some(u => u[key] !== undefined && u[key] !== null && u[key] !== "");

        const allPossibleColumns = [
            {
                id: "sno",
                header: "S.NO",
                minWidth: "60px",
                show: true,
                render: (_: Agent, idx: number) => (
                    <div className="flex items-center h-12">
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                            {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                        </span>
                    </div>
                )
            },
            {
                id: "name",
                header: "AGENT NAME",
                minWidth: "200px",
                show: true,
                render: (user: Agent) => (
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
                id: "role",
                header: "ROLE",
                minWidth: "140px",
                show: hasData("role"),
                render: (user: Agent) => (
                    <div className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-widest">{format(user.role ? user.role.replace(/_/g, " ") : undefined)}</span>
                    </div>
                )
            },



            {
                id: "unique_id",
                header: "USER ID",
                minWidth: "120px",
                show: hasData("unique_id"),
                render: (user: Agent) => (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md shadow-sm border border-gray-200/50 dark:border-gray-700 text-center">{format(user.unique_id)}</span>
                        </div>
                    </div>
                )
            },


            {
                id: "reference_id",
                header: "REFERENCE ID",
                minWidth: "120px",
                show: hasData("reference_id"),
                render: (user: Agent) => (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md shadow-sm border border-gray-200/50 dark:border-gray-700 text-center">{format(user.reference_id)}</span>
                        </div>
                    </div>
                )
            },



            {
                id: "dob",
                header: "DOB",
                minWidth: "120px",
                show: hasData("date_of_birth"),
                render: (user: Agent) => (
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : "-"}
                    </div>
                )
            },



            {
                id: "gender",
                header: "GENDER",
                minWidth: "100px",
                show: hasData("gender"),
                render: (user: Agent) => (
                    <div className="text-xs font-bold text-gray-700 dark:text-gray-300 capitalize tracking-wide">
                        {format(user.gender?.toLowerCase())}
                    </div>
                )
            },




            {
                id: "alt_phone",
                header: "ALT PHONE",
                minWidth: "140px",
                show: hasData("alternate_phone_number"),
                render: (user: Agent) => (
                    <div className="text-xs font-mono font-bold text-gray-600 dark:text-gray-300">
                        {format(user.alternate_phone_number)}
                    </div>
                )
            },






            {
                id: "otp_verified",
                header: "VERIFIED",
                minWidth: "120px",
                show: hasData("otp_verified"),
                render: (user: Agent) => (
                    user.otp_verified ? (
                        <Badge size="sm" color="info">VERIFIED</Badge>
                    ) : (
                        <Badge size="sm" color="warning">PENDING</Badge>
                    )
                )
            },
            {
                id: "farmers",
                header: "FARMERS",
                minWidth: "150px",
                show: true,
                render: (user: Agent) => (
                    <FarmerCountCell count={user.farmer_count} />
                )
            },
            {
                id: "status",
                header: "STATUS",
                minWidth: "120px",
                show: true, // Always show status as it has action
                render: (user: Agent) => {
                    const isActive = user.is_active !== false && (user.status_label === 'ACTIVE' || !user.status_label && user.is_active);
                    return (
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border shadow-sm ${isActive ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'}`}>
                            <div className={`size-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{isActive ? 'ACTIVE' : 'INACTIVE'}</span>
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
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentUsers = users.slice(startIndex, endIndex);

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

                <div className="flex items-center gap-3">
                    {onAddClick && (
                        <Button
                            onClick={onAddClick}
                            size="sm"
                            startIcon={<span className="text-xl">+</span>}
                        >
                            {addLabel || "Add New"}
                        </Button>
                    )}
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
                                    <TableCell className="py-8 text-center text-gray-500" colSpan={columns.length + 1}>
                                        Loading agents...
                                    </TableCell>
                                </TableRow>
                            ) : currentUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell className="py-8 text-center text-gray-500" colSpan={columns.length + 1}>
                                        No agents found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentUsers.map((user, index) => (
                                    <TableRow
                                        key={index}
                                        className="hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-all duration-200 group cursor-pointer"
                                        onClick={() => onRowClick ? onRowClick(user) : navigate(`/agents/${user.unique_id}`)}
                                    >
                                        {columns.map((col, colIdx) => (
                                            <TableCell key={col.id} className={`py-5 align-top ${colIdx === 0 ? 'pl-8' : 'px-4'}`}>
                                                {col.render(user, index)}
                                            </TableCell>
                                        ))}

                                        {/* <TableCell className="py-5 pr-8 text-right align-top">
                                            <div className="min-w-[120px] flex items-center justify-end gap-2.5 transition-opacity ml-auto">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onRowClick ? onRowClick(user) : navigate(`/agents/${user.phone_number}`)
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-brand-600 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-800"
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="size-4" />
                                                </button>

                                                
                                                {onStatusToggle && (
                                                    user.is_active !== false && (user.status_label === 'ACTIVE' || !user.status_label) ? (
                                                        <button
                                                            className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-gray-500 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors min-w-[80px]"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onStatusToggle(user);
                                                            }}
                                                        >
                                                            Deactivate
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors min-w-[80px]"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onStatusToggle(user);
                                                            }}
                                                        >
                                                            Activate
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </TableCell> */}
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
