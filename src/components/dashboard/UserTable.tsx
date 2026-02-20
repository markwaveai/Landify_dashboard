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
import { EyeIcon } from "../../icons";

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
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300">
                                Name
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300">
                                Phone
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300">
                                Unique ID
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300">
                                Role
                            </TableCell>
                            {showFarmerCount && (
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300">
                                    Farmers
                                </TableCell>
                            )}
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300">
                                Village
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300">
                                Mandal
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300">
                                District
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300">
                                State
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300">
                                Pincode
                            </TableCell>
                            {!hideStatus && (
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300">
                                    Status
                                </TableCell>
                            )}
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300">
                                Land
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
                                        navigate(`/farmers/${user.phone_number}`);
                                    }
                                }}
                                className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
                            >
                                <TableCell className="py-3">
                                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                        {user.first_name} {user.last_name}
                                    </p>
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {user.phone_number}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {user.unique_id || "-"}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    <Badge size="sm" color="success">
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                {showFarmerCount && (
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {user.farmer_count !== undefined ? user.farmer_count : "-"}
                                    </TableCell>
                                )}
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {user.village || "-"}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {user.mandal || "-"}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {user.district || "-"}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {user.state || "-"}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {user.pincode || "-"}
                                </TableCell>
                                {!hideStatus && (
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {getStatusBadge(user)}
                                    </TableCell>
                                )}
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-100 dark:bg-white/[0.05] px-2 py-1 rounded-md">
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                {user.land_count || 0}
                                            </span>
                                        </div>
                                        <Link
                                            to={`/farmers/${user.phone_number}`}
                                            className="text-gray-400 hover:text-primary-600 transition-colors"
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
                                <TableCell className="py-3 text-center" colSpan={10}>
                                    Loading...
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && users.length === 0 && (
                            <TableRow>
                                <TableCell className="py-3 text-center" colSpan={10}>
                                    No data found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
