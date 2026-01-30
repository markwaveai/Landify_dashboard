import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

interface Land {
    id: number;
    user_id: number;
    survey_no: string;
    area_in_acres: number;
    status: string;
    land_type?: string;
    water_source?: string;
    ownership_details?: string;
    ao_reason?: string;
    admin_reason?: string;
}

interface LandTableProps {
    title: string;
    lands: Land[];
    onRowClick?: (land: Land) => void;
    isLoading?: boolean;
}

export default function LandTable({ title, lands, onRowClick, isLoading }: LandTableProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "warning";
            case "AO_APPROVED":
                return "info";
            case "ADMIN_APPROVED":
                return "success";
            case "REJECTED":
                return "error";
            default:
                return "light";
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
            </div>
            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Land ID
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Survey No
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Area (Acres)
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Type
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Ownership
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Status
                            </TableCell>
                            {(lands.some(l => l.ao_reason || l.admin_reason)) && (
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Remarks
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {lands.map((land, index) => (
                            <TableRow
                                key={index}
                                onClick={() => onRowClick && onRowClick(land)}
                                className={onRowClick ? "cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/[0.02]" : ""}
                            >
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {land.id}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {land.survey_no}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {land.area_in_acres}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {land.land_type || "-"}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {land.ownership_details || "-"}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    <Badge size="sm" color={getStatusColor(land.status)}>
                                        {land.status}
                                    </Badge>
                                </TableCell>
                                {(lands.some(l => l.ao_reason || l.admin_reason)) && (
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {land.admin_reason || land.ao_reason || "-"}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                        {isLoading && (
                            <TableRow>
                                <TableCell className="py-3 text-center" colSpan={7}>
                                    Loading...
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && lands.length === 0 && (
                            <TableRow>
                                <TableCell className="py-3 text-center" colSpan={7}>
                                    No lands found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
