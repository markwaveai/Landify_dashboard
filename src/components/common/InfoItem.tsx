import React from "react";

interface InfoItemProps {
    label: string;
    value: string | undefined;
    icon?: React.ReactNode;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, icon }) => (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl">
        {icon && <div className="text-gray-400">{icon}</div>}
        <div className="overflow-hidden min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800 dark:text-white/90 break-words line-clamp-2" title={value}>{value || "N/A"}</p>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider truncate">{label}</p>
        </div>
    </div>
);

export default InfoItem;
