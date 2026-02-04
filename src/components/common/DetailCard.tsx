import React from "react";

interface DetailCardProps {
    title: string;
    children: React.ReactNode;
}

const DetailCard: React.FC<DetailCardProps> = ({ title, children }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
        <h3 className="text-lg font-bold mb-5 text-gray-800 dark:text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
            {title}
        </h3>
        <div className="space-y-4">{children}</div>
    </div>
);

export default DetailCard;
