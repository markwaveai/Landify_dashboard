import React from "react";

interface InfoItemProps {
    label: string;
    value: string | undefined;
    icon?: React.ReactNode;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, icon }) => (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl">
        {icon && <div className="text-gray-400">{icon}</div>}
        <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{value || "N/A"}</p>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{label}</p>
        </div>
    </div>
);

export default InfoItem;
