import React from "react";
import FodderProcurement from "../../components/dashboard/FodderProcurement";

const FodderProcurementPage: React.FC = () => {
    return (
        <>
            <div className="2xl:p-10">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        Fodder Procurement & Operations
                    </h2>
                </div>
                <FodderProcurement />
            </div>
        </>
    );
};

export default FodderProcurementPage;
