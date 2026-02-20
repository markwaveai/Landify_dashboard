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
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
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
            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y bg-gray-50/50 dark:bg-white/[0.02]">
                        <TableRow>
                            {columns.map(col => (
                                <TableCell key={col.id} isHeader className="py-3 px-4 font-medium text-gray-500 text-left text-xs uppercase tracking-wider whitespace-nowrap dark:text-gray-400">
                                    <div style={{ minWidth: col.minWidth }}>{col.header}</div>
                                </TableCell>
                            ))}
                            <TableCell isHeader className="py-3 px-4 font-medium text-gray-500 text-left text-xs uppercase tracking-wider whitespace-nowrap dark:text-gray-400">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
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
                                    className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                                    onClick={() => onRowClick ? onRowClick(user) : navigate(`/agents/${user.phone_number}`)}
                                >
                                    {columns.map(col => (
                                        <TableCell key={col.id} className="py-4 px-4 align-middle">
                                            {col.render(user)}
                                        </TableCell>
                                    ))}

                                    <TableCell className="py-4 px-4 align-middle text-gray-500 text-sm dark:text-gray-400 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRowClick ? onRowClick(user) : navigate(`/agents/${user.phone_number}`)
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <EyeIcon className="size-4" />
                                            </button>

                                            {/* Activate/Deactivate Button */}
                                            {onStatusToggle && (
                                                user.is_active !== false && (user.status_label === 'ACTIVE' || !user.status_label) ? (
                                                    <button
                                                        className="px-3 py-1 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors min-w-[80px]"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onStatusToggle(user);
                                                        }}
                                                    >
                                                        Deactivate
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors min-w-[80px]"
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

            {/* Pagination Controls */}
            {!isLoading && users.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
                    <p className="text-xs text-gray-500 dark:text-gray-300 font-medium">
                        Showing <span className="text-gray-800 dark:text-white font-bold">{users.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="text-gray-800 dark:text-white font-bold">{Math.min(currentPage * ITEMS_PER_PAGE, users.length)}</span> of <span className="text-gray-800 dark:text-white font-bold">{users.length}</span> entries
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white/[0.05] dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.1] transition-colors"
                        >
                            Previous
                        </button>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white/[0.05] dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.1] transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
