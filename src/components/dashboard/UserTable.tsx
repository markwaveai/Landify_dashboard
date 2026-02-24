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
import { EyeIcon, UserIcon } from "../../icons";

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
}

export default function UserTable({ title, users, onAddClick, onRowClick, addLabel, isLoading, hideStatus, showFarmerCount }: UserTableProps) {
    const navigate = useNavigate();

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
                            <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-start text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                <div className="flex items-center h-10">S.No</div>
                            </TableCell>
                            <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-start text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                <div className="flex items-center h-10"></div>
                            </TableCell>
                            <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-start text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                <div className="flex items-center h-10">Name</div>
                            </TableCell>
                            <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-start text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                <div className="flex items-center h-10 pl-3">Phone</div>
                            </TableCell>
                            <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-start text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                <div className="flex items-center h-10">Unique ID</div>
                            </TableCell>
                            <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-start text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                <div className="flex items-center h-10  pl-4">Role</div>
                            </TableCell>
                            {showFarmerCount && (
                                <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-start text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                    <div className="flex items-center h-10">Farmers</div>
                                </TableCell>
                            )}
                            <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-start text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                <div className="flex items-center h-10 ">Village</div>
                            </TableCell>
                            <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-start text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                <div className="flex items-center h-10">Mandal</div>
                            </TableCell>
                            <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-start text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                <div className="flex items-center h-10">District</div>
                            </TableCell>
                            <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-start text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                <div className="flex items-center h-10">State</div>
                            </TableCell>
                            <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-start text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                <div className="flex items-center h-10">Pincode</div>
                            </TableCell>
                            {!hideStatus && (
                                <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-start text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                    <div className="flex items-center h-10">Status</div>
                                </TableCell>
                            )}
                            <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-start text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                <div className="flex items-center h-10">Land</div>
                            </TableCell>
                            <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-start text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                <div className="flex items-center h-10">Acres</div>
                            </TableCell>
                            <TableCell isHeader className="px-5 py-4 align-middle font-bold text-gray-400 text-end text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 whitespace-nowrap">
                                <div className="flex items-center justify-end h-10">Action</div>
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {users.map((user, index) => (
                            <TableRow
                                key={index}
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
                                <TableCell className="px-5 py-4 align-middle">
                                    <div className="flex items-center h-10">
                                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{index + 1}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-5 py-4 align-middle">
                                    <div className="flex items-center h-10">
                                        <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm relative transition-colors flex items-center justify-center">
                                            {user.user_image_url ? (
                                                <img src={user.user_image_url} alt="avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="size-5 text-gray-400 dark:text-gray-500" />
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-5 py-4 align-middle whitespace-nowrap">
                                    <div className="flex items-center h-10">
                                        <span className="font-bold text-gray-900 dark:text-white text-sm tracking-tight">{user.first_name} {user.last_name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-5 py-4 align-middle whitespace-nowrap">
                                    <div className="flex items-center h-10">
                                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{user.phone_number}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-5 py-4 align-middle whitespace-nowrap">
                                    <div className="flex items-center h-10">
                                        <span className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400">{user.unique_id || "-"}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-5 py-4 align-middle">
                                    <div className="flex items-center h-10">
                                        <Badge size="sm" color="success">{user.role}</Badge>
                                    </div>
                                </TableCell>
                                {showFarmerCount && (
                                    <TableCell className="px-5 py-4 align-middle">
                                        <div className="flex items-center h-10 pl-4">
                                            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{user.farmer_count !== undefined ? user.farmer_count : "-"}</span>
                                        </div>
                                    </TableCell>
                                )}
                                <TableCell className="px-5 py-4 align-middle whitespace-nowrap">
                                    <div className="flex items-center h-10 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                        {user.village || "-"}
                                    </div>
                                </TableCell>
                                <TableCell className="px-5 py-4 align-middle whitespace-nowrap">
                                    <div className="flex items-center h-10 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                        {user.mandal || "-"}
                                    </div>
                                </TableCell>
                                <TableCell className="px-5 py-4 align-middle whitespace-nowrap">
                                    <div className="flex items-center h-10 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                        {user.district || "-"}
                                    </div>
                                </TableCell>
                                <TableCell className="px-5 py-4 align-middle whitespace-nowrap">
                                    <div className="flex items-center h-10 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                        {user.state || "-"}
                                    </div>
                                </TableCell>
                                <TableCell className="px-5 py-4 align-middle whitespace-nowrap">
                                    <div className="flex items-center h-10 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                        {user.pincode || "-"}
                                    </div>
                                </TableCell>
                                {!hideStatus && (
                                    <TableCell className="px-5 py-4 align-middle">
                                        <div className="flex items-center h-10">
                                            {getStatusBadge(user)}
                                        </div>
                                    </TableCell>
                                )}
                                <TableCell className="px-5 py-4 align-middle">
                                    <div className="flex items-center h-10">
                                        <div className="bg-gray-100 dark:bg-white/[0.05] px-2.5 py-1 rounded-lg min-w-[32px] text-center">
                                            <span className="text-xs font-black text-gray-700 dark:text-gray-300">{user.land_count || 0}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-5 py-4 align-middle">
                                    <div className="flex items-center h-10">
                                        <div className="bg-brand-50/50 dark:bg-brand-500/10 px-2.5 py-1 rounded-lg min-w-[40px] text-center border border-brand-100 dark:border-brand-500/20">
                                            <span className="text-xs font-black text-brand-600 dark:text-brand-400">{user.total_acres !== undefined ? user.total_acres.toFixed(1) : "0.0"}</span>
                                        </div>
                                    </div>
                                </TableCell>
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
                            </TableRow>
                        ))}
                        {isLoading && (
                            <TableRow>
                                <TableCell className="px-5 py-4 text-center" colSpan={16}>
                                    <div className="flex items-center justify-center h-10 text-gray-400 font-medium">Loading agents data...</div>
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && users.length === 0 && (
                            <TableRow>
                                <TableCell className="px-5 py-4 text-center" colSpan={16}>
                                    <div className="flex items-center justify-center h-10 text-gray-400 font-medium">No agents discovered yet.</div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
