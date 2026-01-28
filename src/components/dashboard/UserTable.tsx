import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import { Link, useNavigate } from "react-router";
import Badge from "../ui/badge/Badge";
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
}

interface UserTableProps {
    title: string;
    users: User[];
    onAddClick?: () => void;
    onAddLand?: (user: User) => void;
    addLabel?: string;
    isLoading?: boolean;
}

export default function UserTable({ title, users, onAddClick, onAddLand, addLabel, isLoading }: UserTableProps) {
    const navigate = useNavigate();
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
                        <button
                            onClick={onAddClick}
                            className="inline-flex items-center gap-2 rounded-lg border border-primary-600 bg-primary-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-primary-700 disabled:opacity-50"
                        >
                            {addLabel || "Add New"}
                        </button>
                    )}
                </div>
            </div>
            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Name
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Phone
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Unique ID
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Role
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Village
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Mandal
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                District
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                State
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Pincode
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {users.map((user, index) => (
                            <TableRow
                                key={index}
                                onClick={() => navigate(`/farmers/${user.phone_number}`)}
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
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    <div className="flex items-center gap-3">
                                        {onAddLand && (
                                            <button
                                                onClick={() => onAddLand(user)}
                                                className="text-primary-600 hover:text-primary-700 font-medium"
                                            >
                                                + Land
                                            </button>
                                        )}
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
