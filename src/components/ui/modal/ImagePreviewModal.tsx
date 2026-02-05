import React from "react";
import { Modal } from "./index";

interface ImagePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    title?: string;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
    isOpen,
    onClose,
    imageUrl,
    title,
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg max-h-[85vh]">
            <div className="p-1">
                {title && (
                    <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">
                            {title}
                        </h3>
                    </div>
                )}
                <div className="p-2 sm:p-3 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={title || "Preview"}
                        className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-xl"
                    />
                </div>
                <div className="p-4 flex justify-end gap-3 bg-white dark:bg-gray-900 rounded-b-3xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};
