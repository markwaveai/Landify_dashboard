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
    const isPdf = imageUrl?.toLowerCase().endsWith('.pdf') || imageUrl?.toLowerCase().includes('pdf');

    return (
        <Modal isOpen={isOpen} onClose={onClose} className={isPdf ? "max-w-4xl w-full h-[90vh]" : "max-w-lg max-h-[85vh]"}>
            <div className="p-1 h-full flex flex-col">
                {title && (
                    <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <h3 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">
                            {title}
                        </h3>
                        {isPdf && (
                            <a
                                href={imageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-primary-600 hover:underline font-bold"
                            >
                                Open in New Tab
                            </a>
                        )}
                    </div>
                )}
                <div className={`p-2 sm:p-3 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 overflow-hidden ${isPdf ? 'flex-1' : ''}`}>
                    {isPdf ? (
                        <div className="w-full h-full flex flex-col">
                            <iframe
                                src={imageUrl}
                                title={title || "PDF Preview"}
                                className="w-full h-full rounded-lg min-h-[60vh] border-0"
                            />
                            <div className="text-center py-2 text-[10px] text-gray-400">
                                Having trouble viewing? <a href={imageUrl} target="_blank" rel="noreferrer" className="text-primary-600 font-bold hover:underline">Download</a> or <a href={imageUrl} target="_blank" rel="noreferrer" className="text-primary-600 font-bold hover:underline">Open in new tab</a>
                            </div>
                        </div>
                    ) : (
                        <img
                            src={imageUrl}
                            alt={title || "Preview"}
                            className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-xl"
                        />
                    )}
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
