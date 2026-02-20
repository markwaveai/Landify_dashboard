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
import { EyeIcon, ChevronLeftIcon } from "../../icons";
import { useQuery } from "@tanstack/react-query";
import { getAgentFarmers } from "../../services/userService";

const FarmerCountCell = ({ agentId }: { agentId: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { data: users, isLoading } = useQuery({
        queryKey: ['agent-farmers', agentId],
        queryFn: () => getAgentFarmers(agentId),
        enabled: !!agentId
    });

    if (isLoading) return (
        <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-gray-200 animate-pulse"></div>
            <span className="text-xs text-gray-400 italic">loading...</span>
        </div>
    );

    const farmers = users?.filter((u: any) => u.role === 'FARMER') || [];
    const count = farmers.length;

    if (count === 0) return (
        <div className="text-sm text-gray-400 font-medium italic">
            0 Farmers
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
                <div className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all ${isExpanded ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-50 text-amber-700 group-hover/btn:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                    {count} {count === 1 ? 'Farmer' : 'Farmers'}
                </div>
                <ChevronLeftIcon className={`size-3 transition-transform text-gray-400 ${isExpanded ? 'rotate-[-90deg]' : 'rotate-[-180deg]'}`} />
            </button>

            {isExpanded && (
                <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-gray-100 dark:border-gray-800 p-2.5 space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar w-[180px] shadow-inner" onClick={e => e.stopPropagation()}>
                    <p className="text-[10px] font-bold text-amber-600/60 uppercase tracking-widest border-b border-gray-200/50 dark:border-gray-700/50 pb-1.5 mb-2 font-outfit">FARMER IDS</p>
                    <div className="space-y-1.5">
                        {farmers.map((farmer: any) => (
                            <div key={farmer.unique_id} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:border-amber-200 dark:hover:border-amber-800">
                                <span className="text-[10px] font-mono font-bold text-gray-600 dark:text-gray-300">
                                    {farmer.unique_id || "No ID"}
                                </span>
                                <div className="size-1.5 rounded-full bg-amber-500"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
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
    onStatusToggle?: (agent: Agent) => void;
    addLabel?: string;
    isLoading?: boolean;
}

const ITEMS_PER_PAGE = 5;

// Helper to render image link
const ImageLink = ({ url, label }: { url?: string, label: string }) => {
    if (!url) return <span className="text-gray-400">-</span>;
    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400" onClick={(e) => e.stopPropagation()}>
            View {label}
        </a>
    );
};

export default function AgentTable({ title, users, onAddClick, onRowClick, onStatusToggle, addLabel, isLoading }: AgentTableProps) {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);

    // Dynamic columns logic
    const columns = useMemo(() => {
        if (!users || users.length === 0) return [];

        const hasData = (key: keyof Agent) => users.some(u => u[key] !== undefined && u[key] !== null && u[key] !== "");

        const allPossibleColumns = [
            {
                id: "name",
                header: "AGENT NAME",
                minWidth: "200px",
                show: true,
                render: (user: Agent) => (
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 font-medium text-sm shrink-0 overflow-hidden">
                            {user.user_image_url ? (
                                <img src={user.user_image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span>{user.first_name?.[0]}{user.last_name?.[0]}</span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-sm dark:text-white/90 truncate">
                                {user.first_name} {user.last_name}
                            </p>
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
                    <Badge size="sm" color="info">
                        {user.role ? user.role.replace(/_/g, " ") : "-"}
                    </Badge>
                )
            },



            {
                id: "unique_id",
                header: "USER ID",
                minWidth: "120px",
                show: hasData("unique_id"),
                render: (user: Agent) => (
                    <div className="text-gray-500 text-sm dark:text-gray-400 font-mono">
                        {user.unique_id || "-"}
                    </div>
                )
            },


            {
                id: "reference_id",
                header: "REFERENCE ID",
                minWidth: "120px",
                show: hasData("reference_id"),
                render: (user: Agent) => (
                    <div className="text-gray-500 text-sm dark:text-gray-400 font-mono">
                        {user.reference_id || "-"}
                    </div>
                )
            },



            {
                id: "dob",
                header: "DOB",
                minWidth: "120px",
                show: hasData("date_of_birth"),
                render: (user: Agent) => (
                    <div className="text-gray-500 text-sm dark:text-gray-400">
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
                    <div className="text-gray-500 text-sm dark:text-gray-400 capitalize">
                        {user.gender?.toLowerCase() || "-"}
                    </div>
                )
            },


            {
                id: "phone_number",
                header: "MOBILE NUMBER",
                minWidth: "140px",
                show: hasData("phone_number"),
                render: (user: Agent) => (
                    <div className="text-gray-500 text-sm dark:text-gray-400 font-mono">
                        {user.phone_number}
                    </div>
                )
            },


            {
                id: "email",
                header: "EMAIL",
                minWidth: "180px",
                show: hasData("email"),
                render: (user: Agent) => (
                    <div className="text-gray-500 text-sm dark:text-gray-400">
                        {user.email || "-"}
                    </div>
                )
            },

            {
                id: "alt_phone",
                header: "ALT PHONE",
                minWidth: "140px",
                show: hasData("alternate_phone_number"),
                render: (user: Agent) => (
                    <div className="text-gray-500 text-sm dark:text-gray-400 font-mono">
                        {user.alternate_phone_number || "-"}
                    </div>
                )
            },





            {
                id: "address",
                header: "ADDRESS",
                minWidth: "250px",
                show: hasData("village") || hasData("mandal") || hasData("district") || hasData("state") || hasData("address") || hasData("city") || hasData("pincode"),
                render: (user: Agent) => {
                    const parts = [
                        user.address,
                        user.village,
                        user.mandal,
                        user.city,
                        user.district,
                        user.state,
                        user.pincode
                    ].filter(p => p && p.trim() !== "");

                    const displayAddress = parts.length > 0 ? parts.join(", ") : "-";
                    return (
                        <div className="text-gray-500 text-sm dark:text-gray-300 truncate max-w-[250px]" title={displayAddress}>
                            {displayAddress}
                        </div>
                    )
                }
            },

            // Extra Details
            {
                id: "aadhar",
                header: "AADHAR NO",
                minWidth: "140px",
                show: hasData("aadhar_card_number"),
                render: (user: Agent) => (
                    <div className="text-gray-500 text-sm dark:text-gray-300 font-mono">
                        {user.aadhar_card_number || "-"}
                    </div>
                )
            },
            {
                id: "pan",
                header: "PAN NO",
                minWidth: "140px",
                show: hasData("pan_number"),
                render: (user: Agent) => (
                    <div className="text-gray-500 text-sm dark:text-gray-300 font-mono">
                        {user.pan_number || "-"}
                    </div>
                )
            },
            {
                id: "bank_details",
                header: "BANK DETAILS",
                minWidth: "180px",
                show: hasData("bank_name") || hasData("account_number") || hasData("ifsc_code") || hasData("bank_branch") || hasData("bank_passbook_image_url"),
                render: (user: Agent) => (
                    <div className="text-gray-500 text-xs dark:text-gray-300 space-y-1">
                        {user.bank_name && <div className="font-semibold text-gray-800 dark:text-white/90 uppercase">{user.bank_name}</div>}
                        {user.account_number && <div><span className="text-[10px] text-gray-400 dark:text-gray-400">A/C:</span> {user.account_number}</div>}
                        {user.ifsc_code && <div><span className="text-[10px] text-gray-400 dark:text-gray-400">IFSC:</span> {user.ifsc_code}</div>}
                        {user.bank_branch && <div><span className="text-[10px] text-gray-400 dark:text-gray-400">Branch:</span> {user.bank_branch}</div>}
                        {user.bank_passbook_image_url && (
                            <div className="pt-1">
                                <ImageLink url={user.bank_passbook_image_url} label="Passbook" />
                            </div>
                        )}
                        {!user.bank_name && !user.account_number && !user.ifsc_code && !user.bank_branch && !user.bank_passbook_image_url && "-"}
                    </div>
                )
            },

            {
                id: "verification",
                header: "VERIFICATION",
                minWidth: "160px",
                show: true,
                render: (user: Agent) => (
                    <div className="text-xs space-y-1">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-gray-400 dark:text-gray-400 text-[10px] uppercase">Photo:</span>
                            {user.user_image_url ? <ImageLink url={user.user_image_url} label="Image" /> : <span className="text-gray-400 dark:text-gray-300 font-medium italic">null</span>}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-gray-400 dark:text-gray-400 text-[10px] uppercase">Aadhar:</span>
                            {user.aadhar_image_url ? <ImageLink url={user.aadhar_image_url} label="Card" /> : <span className="text-gray-400 dark:text-gray-300 font-medium italic">null</span>}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-gray-400 dark:text-gray-400 text-[10px] uppercase">PAN:</span>
                            {user.pan_image_url ? <ImageLink url={user.pan_image_url} label="Card" /> : <span className="text-gray-400 dark:text-gray-300 font-medium italic">null</span>}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-gray-400 dark:text-gray-400 text-[10px] uppercase">Agreement:</span>
                            {user.agreement_url ? <ImageLink url={user.agreement_url} label="File" /> : <span className="text-gray-400 dark:text-gray-300 font-medium italic">null</span>}
                        </div>
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
                    <FarmerCountCell agentId={user.unique_id || user.phone_number} />
                )
            },
            {
                id: "status",
                header: "STATUS",
                minWidth: "120px",
                show: true, // Always show status as it has action
                render: (user: Agent) => {
                    const isActive = user.is_active !== false && (user.status_label === 'ACTIVE' || !user.status_label && user.is_active);
                    if (isActive) return <Badge size="sm" color="success">Active</Badge>;
                    return <Badge size="sm" color="light">Inactive</Badge>;
                }
            }
        ];

        return allPossibleColumns.filter(col => col.show);
    }, [users]);


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
                                <TableCell isHeader className="py-5 pr-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                                    <div className="min-w-[90px] flex justify-end">ACTIONS</div>
                                </TableCell>
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
                                        onClick={() => onRowClick ? onRowClick(user) : navigate(`/agents/${user.phone_number}`)}
                                    >
                                        {columns.map((col, colIdx) => (
                                            <TableCell key={col.id} className={`py-5 align-top ${colIdx === 0 ? 'pl-8' : 'px-4'}`}>
                                                {col.render(user)}
                                            </TableCell>
                                        ))}

                                        <TableCell className="py-5 pr-8 text-right align-top">
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

                                                {/* Activate/Deactivate Button */}
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
                                        </TableCell>
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
