import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import Badge from "../ui/badge/Badge";

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
    bond_duration?: string;
    payment_status?: 'Paid' | 'Pending';
}

interface FarmerTableProps {
    title?: string;
    users: Farmer[];
    onRowClick?: (farmer: Farmer) => void;
    isLoading?: boolean;
}

const ITEMS_PER_PAGE = 5;

// Helper to render image link
const ImageLink = ({ url, label }: { url?: string, label: string }) => {
    if (!url) return <span className="text-gray-400">-</span>;
    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-brand-500 hover:text-brand-600 hover:underline dark:text-brand-400" onClick={(e) => e.stopPropagation()}>
            View {label}
        </a>
    );
};

export default function FarmerTable({ users, onRowClick, isLoading }: FarmerTableProps) {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);

    // Dynamic columns logic
    const columns = useMemo(() => {
        if (!users || users.length === 0) return [];

        const hasData = (key: keyof Farmer) => users.some(u => u[key] !== undefined && u[key] !== null && u[key] !== "");

        const allPossibleColumns = [
            {
                id: "name",
                header: "FARMER NAME",
                minWidth: "200px",
                show: true,
                render: (user: Farmer) => (
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
                id: "phone_number",
                header: "MOBILE NUMBER",
                minWidth: "140px",
                show: hasData("phone_number"),
                render: (user: Farmer) => (
                    <div className="text-gray-500 text-sm dark:text-gray-400 font-mono">
                        {user.phone_number}
                    </div>
                )
            },
            {
                id: "alt_phone",
                header: "ALT PHONE",
                minWidth: "140px",
                show: hasData("alternate_phone_number"),
                render: (user: Farmer) => (
                    <div className="text-gray-500 text-sm dark:text-gray-400 font-mono">
                        {user.alternate_phone_number || "-"}
                    </div>
                )
            },
            {
                id: "email",
                header: "EMAIL",
                minWidth: "180px",
                show: hasData("email"),
                render: (user: Farmer) => (
                    <div className="text-gray-500 text-sm dark:text-gray-400">
                        {user.email || "-"}
                    </div>
                )
            },
            {
                id: "role",
                header: "ROLE",
                minWidth: "140px",
                show: hasData("role"),
                render: (user: Farmer) => (
                    <Badge size="sm" color="info">
                        {user.role ? user.role.replace(/_/g, " ") : "FARMER"}
                    </Badge>
                )
            },
            {
                id: "unique_id",
                header: "USER ID",
                minWidth: "120px",
                show: hasData("unique_id"),
                render: (user: Farmer) => (
                    <div className="text-gray-500 text-sm dark:text-gray-400 font-mono">
                        {user.unique_id || "-"}
                    </div>
                )
            },
            {
                id: "reference_id",
                header: "REF ID",
                minWidth: "120px",
                show: hasData("reference_id"),
                render: (user: Farmer) => (
                    <div className="text-gray-500 text-sm dark:text-gray-300 font-mono">
                        {user.reference_id || "-"}
                    </div>
                )
            },
            {
                id: "gender",
                header: "GENDER",
                minWidth: "100px",
                show: hasData("gender"),
                render: (user: Farmer) => (
                    <div className="text-gray-500 text-sm dark:text-gray-300 capitalize">
                        {user.gender?.toLowerCase() || "-"}
                    </div>
                )
            },
            {
                id: "dob",
                header: "DOB",
                minWidth: "120px",
                show: hasData("date_of_birth"),
                render: (user: Farmer) => (
                    <div className="text-gray-500 text-sm dark:text-gray-300">
                        {user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : "-"}
                    </div>
                )
            },

            {
                id: "address",
                header: "ADDRESS",
                minWidth: "250px",
                show: hasData("village") || hasData("mandal") || hasData("district") || hasData("state") || hasData("address") || hasData("city") || hasData("pincode"),
                render: (user: Farmer) => {
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
                render: (user: Farmer) => (
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
                render: (user: Farmer) => (
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
                render: (user: Farmer) => (
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
                render: (user: Farmer) => (
                    <div className="text-xs space-y-1">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-gray-400 dark:text-gray-400 text-[10px] uppercase">Photo:</span>
                            {user.user_image_url ? <ImageLink url={user.user_image_url} label="Image" /> : <span className="text-gray-400 dark:text-gray-400">-</span>}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-gray-400 dark:text-gray-400 text-[10px] uppercase">Aadhar:</span>
                            {user.aadhar_image_url ? <ImageLink url={user.aadhar_image_url} label="Card" /> : <span className="text-gray-400 dark:text-gray-400">-</span>}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-gray-400 dark:text-gray-400 text-[10px] uppercase">PAN:</span>
                            {user.pan_image_url ? <ImageLink url={user.pan_image_url} label="Card" /> : <span className="text-gray-400 dark:text-gray-400">-</span>}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-gray-400 dark:text-gray-400 text-[10px] uppercase">Passbook:</span>
                            {user.bank_passbook_image_url ? <ImageLink url={user.bank_passbook_image_url} label="Passbook" /> : <span className="text-gray-400 dark:text-gray-400">-</span>}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-gray-400 dark:text-gray-400 text-[10px] uppercase">Agreement:</span>
                            {user.agreement_url ? <ImageLink url={user.agreement_url} label="File" /> : <span className="text-gray-400 dark:text-gray-400">-</span>}
                        </div>
                    </div>
                )
            },
            {
                id: "land_count",
                header: "LANDS",
                minWidth: "100px",
                show: true,
                render: (user: Farmer) => (
                    <div className="text-gray-900 font-medium text-sm dark:text-white/90">
                        {user.land_count || 0}
                    </div>
                )
            },
            {
                id: "otp_verified",
                header: "VERIFIED",
                minWidth: "120px",
                show: hasData("otp_verified"),
                render: (user: Farmer) => (
                    user.otp_verified !== undefined && user.otp_verified !== null ? (
                        user.otp_verified ? (
                            <Badge size="sm" color="info">VERIFIED</Badge>
                        ) : (
                            <Badge size="sm" color="warning">PENDING</Badge>
                        )
                    ) : <span className="text-gray-400">-</span>
                )
            },
            {
                id: "is_active",
                header: "IS ACTIVE",
                minWidth: "120px",
                show: true,
                render: (user: Farmer) => (
                    user.is_active !== undefined && user.is_active !== null ? (
                        <Badge size="sm" color={user.is_active ? 'success' : 'light'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                    ) : <span className="text-gray-400">-</span>
                )
            },
            {
                id: "status",
                header: "STATUS",
                minWidth: "140px",
                show: true,
                render: (user: Farmer) => (
                    user.status ? (
                        <Badge size="sm" color={
                            user.status.toLowerCase().includes('pending') ? 'warning' : 'info'
                        }>
                            {user.status}
                        </Badge>
                    ) : <span className="text-gray-400">-</span>
                )
            },

        ];

        return allPossibleColumns.filter(col => col.show);
    }, [users]);

    // Pagination logic
    const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentUsers = users.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="w-full">
            <div className="min-w-full overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-3">
                    <thead>
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                            </th>
                            {columns.map((col) => (
                                <th
                                    key={col.id}
                                    className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                    style={{ minWidth: col.minWidth }}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="space-y-4">
                        {currentUsers.map((user, index) => (
                            <tr
                                key={index}
                                className="bg-white dark:bg-gray-800 shadow-sm rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
                                onClick={() => onRowClick ? onRowClick(user) : navigate(`/farmers/${user.phone_number}`)}
                            >
                                <td className="px-4 py-4 whitespace-nowrap rounded-l-lg border-y border-l border-gray-100 dark:border-gray-700">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </td>
                                {columns.map((col, colIndex) => (
                                    <td
                                        key={col.id}
                                        className={`px-4 py-4 whitespace-nowrap border-y border-gray-100 dark:border-gray-700 ${colIndex === columns.length - 1 ? "rounded-r-lg border-r" : ""
                                            }`}
                                    >
                                        {col.render(user)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {isLoading && (
                            <tr>
                                <td colSpan={columns.length + 1} className="text-center py-8 text-gray-500">Loading...</td>
                            </tr>
                        )}
                        {!isLoading && users.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + 1} className="text-center py-8 text-gray-500">No farmers found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {!isLoading && users.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-300 font-medium">
                        Showing <span className="text-gray-800 dark:text-white font-bold">{users.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="text-gray-800 dark:text-white font-bold">{Math.min(currentPage * ITEMS_PER_PAGE, users.length)}</span> of <span className="text-gray-800 dark:text-white font-bold">{users.length}</span> entries
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${currentPage === 1
                                ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            &lt;
                        </button>
                        {/* Simple pagination for now */}
                        <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
                        </div>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${currentPage === totalPages
                                ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
