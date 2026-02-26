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
import { UserIcon } from "../../icons";

const format = (val: any) => (val === undefined || val === null || val === "" || val === 0) ? "-" : val;

const FarmerCountCell = ({ count }: { count?: number }) => {
    return (
        <div className="text-sm font-bold text-gray-500 dark:text-gray-400">
            {count || 0}
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
    aadhar_card_number?: string;
    pan_number?: string;
    bank_name?: string;
    account_number?: string;
    ifsc_code?: string;
    bank_branch?: string;
    alternate_phone_number?: string;
    reference_id?: string;
    user_image_url?: string;
    aadhar_image_url?: string;
    pan_image_url?: string;
    bank_passbook_image_url?: string;
    agreement_url?: string;
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
    currentPage?: number;
    onPageChange?: (page: number) => void;
}

const ITEMS_PER_PAGE = 5;

export default function AgentTable({ title, users, onAddClick, onRowClick, addLabel, isLoading, currentPage: propsPage, onPageChange: propsOnPageChange }: AgentTableProps) {
    const navigate = useNavigate();
    const [localPage, setLocalPage] = useState(1);

    const currentPage = propsPage !== undefined ? propsPage : localPage;
    const setCurrentPage = propsOnPageChange !== undefined ? propsOnPageChange : setLocalPage;

    const columns = useMemo(() => {
        if (!users || users.length === 0) return [];

        const hasData = (key: keyof Agent) => users.some(u => u[key] !== undefined && u[key] !== null && u[key] !== "");

        const allPossibleColumns = [
            {
                id: "sno",
                header: "S.NO",
                minWidth: "60px",
                align: "center",
                show: true,
                render: (_: Agent, idx: number) => (
                    <div className="flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                            {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                        </span>
                    </div>
                )
            },
            {
                id: "name",
                header: "AGENT NAME",
                minWidth: "250px",
                align: "center",
                show: true,
                render: (user: Agent) => (
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
                id: "role",
                header: "ROLE",
                minWidth: "140px",
                align: "center",
                show: hasData("role"),
                render: (user: Agent) => (
                    <div className="flex justify-center">
                        <div className="inline-flex items-center text-blue-600 dark:text-blue-400">
                            <span className="text-[10px] font-bold uppercase tracking-widest">{format(user.role ? user.role.replace(/_/g, " ") : undefined)}</span>
                        </div>
                    </div>
                )
            },
            {
                id: "unique_id",
                header: "AGENT ID",
                minWidth: "120px",
                align: "center",
                show: hasData("unique_id"),
                render: (user: Agent) => (
                    <div className="flex justify-center">
                        <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">
                            {format(user.unique_id)}
                        </span>
                    </div>
                )
            },
            {
                id: "reference_id",
                header: "FO ID",
                minWidth: "120px",
                align: "center",
                show: hasData("reference_id"),
                render: (user: Agent) => (
                    <div className="flex justify-center">
                        <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">
                            {format(user.reference_id)}
                        </span>
                    </div>
                )
            },
            {
                id: "village",
                header: "VILLAGE",
                minWidth: "140px",
                align: "center",
                show: hasData("village"),
                render: (user: Agent) => (
                    <div className="flex justify-center">
                        <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                            {format(user.village)}
                        </span>
                    </div>
                )
            },
            {
                id: "dob",
                header: "DOB",
                minWidth: "120px",
                align: "center",
                show: hasData("date_of_birth"),
                render: (user: Agent) => (
                    <div className="flex justify-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : "-"}
                    </div>
                )
            },
            {
                id: "alt_phone",
                header: "ALT PHONE",
                minWidth: "140px",
                align: "center",
                show: hasData("alternate_phone_number"),
                render: (user: Agent) => (
                    <div className="flex justify-center text-xs font-mono font-bold text-gray-600 dark:text-gray-300">
                        {format(user.alternate_phone_number)}
                    </div>
                )
            },
            {
                id: "farmers",
                header: "FARMERS",
                minWidth: "150px",
                align: "center",
                show: true,
                render: (user: Agent) => (
                    <div className="flex justify-center">
                        <FarmerCountCell count={user.farmer_count} />
                    </div>
                )
            },
            {
                id: "otp_verified",
                header: "VERIFIED",
                minWidth: "120px",
                align: "center",
                show: hasData("otp_verified"),
                render: (user: Agent) => (
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
                minWidth: "120px",
                align: "center",
                show: true,
                render: (user: Agent) => {
                    const isActive = user.is_active !== false && (user.status_label === 'ACTIVE' || !user.status_label && user.is_active);
                    return (
                        <div className="flex justify-center">
                            <div className="inline-flex items-center gap-1.5">
                                <div className={`size-1.5 rounded-full ${isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`}></div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                            </div>
                        </div>
                    );
                }
            }
        ];

        return allPossibleColumns.filter(col => col.show);
    }, [users, currentPage]);

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

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-8 bg-gray-50/30 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-300 font-medium">
                        Showing <span className="text-gray-800 dark:text-white font-bold">{users.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="text-gray-800 dark:text-white font-bold">{Math.min(currentPage * ITEMS_PER_PAGE, users.length)}</span> of <span className="text-gray-800 dark:text-white font-bold">{users.length}</span> entries
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                .map((p, i, arr) => (
                                    <span key={p} className="flex items-center">
                                        {i > 0 && arr[i - 1] !== p - 1 && <span className="px-2 text-gray-400">...</span>}
                                        <button
                                            onClick={() => handlePageChange(p)}
                                            className={`min-w-[32px] h-8 rounded-lg text-xs font-bold transition-all ${currentPage === p
                                                ? 'bg-brand-600 text-white shadow-sm'
                                                : 'text-gray-500 hover:bg-white dark:hover:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    </span>
                                ))}
                        </div>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
