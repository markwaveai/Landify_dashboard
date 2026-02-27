import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import { Link, useNavigate } from "react-router";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import { ChevronLeftIcon, EyeIcon, UserIcon } from "../../icons";

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
    is_step1_completed?: boolean;
    is_step2_completed?: boolean;
    is_step3_completed?: boolean;
    is_active?: boolean;
    farmer_count?: number;
    land_count?: number;
    total_acres?: number;
    user_image_url?: string;
}

interface UserTableProps {
    title: string;
    users: User[];
    onAddClick?: () => void;
    onRowClick?: (user: User) => void;
    addLabel?: string;
    isLoading?: boolean;
    hideStatus?: boolean;
    showFarmerCount?: boolean;
    hideAction?: boolean;
    hideDetailedLocation?: boolean;
    hideLocation?: boolean;
    centerAlignName?: boolean;
    itemsPerPage?: number;
}

export default function UserTable({
    title,
    users,
    onAddClick,
    onRowClick,
    addLabel,
    isLoading,
    hideStatus,
    showFarmerCount,
    hideAction,
    hideDetailedLocation,
    hideLocation,
    centerAlignName,
    itemsPerPage = 10
}: UserTableProps) {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);

    const getStatusBadge = (user: User) => {
        if (user.role === 'FARMER') {
            if (user.is_step1_completed && user.is_step2_completed && user.is_step3_completed) {
                return <Badge size="sm" color="success">Active</Badge>;
            } else if (user.is_step1_completed && user.is_step2_completed && !user.is_step3_completed) {
                return <Badge size="sm" color="warning">Pending Step 3</Badge>;
            } else if (user.is_step1_completed && !user.is_step2_completed) {
                return <Badge size="sm" color="warning">Pending Step 2</Badge>;
            } else {
                // Pending Step 1 or inactive
                return <Badge size="sm" color="warning">Pending Step 1</Badge>;
            }
        }
        if (user.role === 'AGENT') {
            if (user.is_step1_completed && user.is_step2_completed) {
                return <Badge size="sm" color="success">Active</Badge>;
            } else if (user.is_step1_completed && !user.is_step2_completed) {
                return <Badge size="sm" color="warning">Pending Step 2</Badge>;
            } else {
                return <Badge size="sm" color="warning">Pending Step 1</Badge>;
            }
        }
        return <Badge size="sm" color="success">Active</Badge>;
    };

    // Pagination logic
    const totalPages = Math.ceil(users.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentUsers = users.slice(startIndex, startIndex + itemsPerPage);

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
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-center text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                <div className="flex items-center justify-center h-10">S.No</div>
                            </TableCell>
                            <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-center text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                <div className="flex items-center justify-center h-10">Name</div>
                            </TableCell>
                            <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-center text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                <div className="flex items-center justify-center h-10 px-3">Phone</div>
                            </TableCell>
                            <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-center text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                <div className="flex items-center justify-center h-10">Unique ID</div>
                            </TableCell>
                            <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-center text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                <div className="flex items-center justify-center h-10 px-4">Role</div>
                            </TableCell>
                            {showFarmerCount && (
                                <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-center text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                    <div className="flex items-center justify-center h-10">Farmers</div>
                                </TableCell>
                            )}
                            {!hideLocation && (
                                <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-center text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                    <div className="flex items-center justify-center h-10 ">Village</div>
                                </TableCell>
                            )}
                            {!hideLocation && !hideDetailedLocation && (
                                <>
                                    <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-center text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                        <div className="flex items-center justify-center h-10">Mandal</div>
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-center text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                        <div className="flex items-center justify-center h-10">District</div>
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-center text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                        <div className="flex items-center justify-center h-10">State</div>
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-center text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                        <div className="flex items-center justify-center h-10">Pincode</div>
                                    </TableCell>
                                </>
                            )}
                            {!hideStatus && (
                                <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-center text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                    <div className="flex items-center justify-center h-10">Status</div>
                                </TableCell>
                            )}
                            <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-center text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                <div className="flex items-center justify-center h-10">Land</div>
                            </TableCell>
                            <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-center text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                <div className="flex items-center justify-center h-10">Acres</div>
                            </TableCell>
                            {!hideAction && (
                                <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-center text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                    <div className="flex items-center justify-center h-10">Action</div>
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {currentUsers.map((user, index) => (
                            <TableRow
                                key={startIndex + index}
                                onClick={() => {
                                    if (onRowClick) {
                                        onRowClick(user);
                                    } else {
                                        const role = user.role?.toUpperCase();
                                        let route = 'farmers';
                                        if (role === 'AGENT') route = 'agents';
                                        else if (role === 'FIELD_OFFICER') route = 'aos';

                                        navigate(`/${route}/${user.unique_id}`);
                                    }
                                }}
                                className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
                            >
                                <TableCell className="px-5 py-4 align-middle text-center">
                                    <div className="flex items-center justify-center h-10">
                                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{startIndex + index + 1}</span>
                                    </div>
                                </TableCell>
                                <TableCell className={`px-5 py-4 align-middle ${centerAlignName ? "text-center" : "text-start"}`}>
                                    <div className={`flex items-center h-10 gap-1.5 ${centerAlignName ? "justify-center" : "justify-start pl-5"}`}>
                                        <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm relative transition-colors flex items-center justify-center">
                                            {user.user_image_url ? (
                                                <img src={user.user_image_url} alt="avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="size-5 text-gray-400 dark:text-gray-500" />
                                            )}
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white text-sm tracking-tight uppercase whitespace-nowrap">{user.first_name} {user.last_name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-5 py-4 align-middle whitespace-nowrap text-center">
                                    <div className="flex items-center justify-center h-10">
                                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{user.phone_number}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-5 py-4 align-middle whitespace-nowrap text-center">
                                    <div className="flex items-center justify-center h-10">
                                        <span className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400">{user.unique_id || "-"}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-5 py-4 align-middle text-center">
                                    <div className="flex items-center justify-center h-10">
                                        <Badge size="sm" color="success">{user.role}</Badge>
                                    </div>
                                </TableCell>
                                {showFarmerCount && (
                                    <TableCell className="px-5 py-4 align-middle text-center">
                                        <div className="flex items-center justify-center h-10">
                                            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{user.farmer_count !== undefined ? user.farmer_count : "-"}</span>
                                        </div>
                                    </TableCell>
                                )}
                                {!hideLocation && (
                                    <TableCell className="px-5 py-4 align-middle whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center h-10 text-sm text-gray-500 dark:text-gray-400 font-bold uppercase">
                                            {user.village || "-"}
                                        </div>
                                    </TableCell>
                                )}
                                {!hideLocation && !hideDetailedLocation && (
                                    <>
                                        <TableCell className="px-5 py-4 align-middle whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center h-10 text-sm text-gray-500 dark:text-gray-400 font-bold uppercase">
                                                {user.mandal || "-"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 align-middle whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center h-10 text-sm text-gray-500 dark:text-gray-400 font-bold uppercase">
                                                {user.district || "-"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 align-middle whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center h-10 text-sm text-gray-500 dark:text-gray-400 font-bold uppercase">
                                                {user.state || "-"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 align-middle whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center h-10 text-sm text-gray-500 dark:text-gray-400 font-bold uppercase">
                                                {user.pincode || "-"}
                                            </div>
                                        </TableCell>
                                    </>
                                )}
                                {!hideStatus && (
                                    <TableCell className="px-5 py-4 align-middle text-center">
                                        <div className="flex items-center justify-center h-10">
                                            {getStatusBadge(user)}
                                        </div>
                                    </TableCell>
                                )}
                                <TableCell className="px-5 py-4 align-middle text-center">
                                    <div className="flex items-center justify-center h-10">
                                        <div className="bg-gray-100 dark:bg-white/[0.05] px-2.5 py-1 rounded-lg min-w-[32px] text-center border border-gray-200 dark:border-gray-700">
                                            <span className="text-xs font-black text-gray-700 dark:text-gray-300">{user.land_count || 0}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-5 py-4 align-middle text-center">
                                    <div className="flex items-center justify-center h-10">
                                        <div className="bg-brand-50/50 dark:bg-brand-500/10 px-2.5 py-1 rounded-lg min-w-[40px] text-center border border-brand-100 dark:border-brand-500/20">
                                            <span className="text-xs font-black text-brand-600 dark:text-brand-400">{user.total_acres !== undefined ? user.total_acres.toFixed(1) : "0.0"}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                {!hideAction && (
                                    <TableCell className="px-5 py-4 text-end align-middle">
                                        <div className="flex items-center justify-end h-10">
                                            <Link
                                                to={(() => {
                                                    const role = user.role?.toUpperCase();
                                                    let route = 'farmers';
                                                    if (role === 'AGENT') route = 'agents';
                                                    else if (role === 'FIELD_OFFICER') route = 'aos';
                                                    return `/${route}/${user.unique_id}`;
                                                })()}
                                                className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-xl transition-all"
                                                title="View Profile"
                                            >
                                                <EyeIcon className="size-5" />
                                            </Link>
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                        {isLoading && (
                            <TableRow>
                                <TableCell className="px-5 py-4 text-center" colSpan={16}>
                                    <div className="flex items-center justify-center h-10 text-gray-400 font-medium">Loading data...</div>
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && users.length === 0 && (
                            <TableRow>
                                <TableCell className="px-5 py-4 text-center" colSpan={16}>
                                    <div className="flex items-center justify-center h-10 text-gray-400 font-medium">No results found.</div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination UI */}
            {!isLoading && users.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Showing <span className="text-gray-800 dark:text-white font-bold">{startIndex + 1}</span> to <span className="text-gray-800 dark:text-white font-bold">{Math.min(startIndex + itemsPerPage, users.length)}</span> of <span className="text-gray-800 dark:text-white font-bold">{users.length}</span> entries
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
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
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <ChevronLeftIcon className="w-4 h-4 rotate-180" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
