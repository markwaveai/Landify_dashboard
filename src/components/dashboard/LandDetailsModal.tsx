import { Modal } from "../ui/modal";
import Label from "../form/Label";


interface LandDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    land: any;
}

export default function LandDetailsModal({ isOpen, onClose, land }: LandDetailsModalProps) {
    if (!land) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl p-6">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    Land Details (ID: {land.id})
                </h3>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">

                {/* Section 1: Basic Info */}
                <div>
                    <h4 className="font-semibold text-gray-700 dark:text-white/90 mb-2">Basic Information</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div><Label>Survey No</Label><div className="text-gray-900 dark:text-white">{land.survey_no}</div></div>
                        <div><Label>Area</Label><div className="text-gray-900 dark:text-white">{land.area_in_acres} Acres</div></div>
                        <div><Label>Land Type</Label><div className="text-gray-900 dark:text-white">{land.land_type || "-"}</div></div>
                        <div><Label>Water Source</Label><div className="text-gray-900 dark:text-white">{land.water_source || "-"}</div></div>
                    </div>
                </div>

                {/* Section 2: Coordinates */}
                <div>
                    <h4 className="font-semibold text-gray-700 dark:text-white/90 mb-2">Coordinates</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="bg-gray-50 dark:bg-white/5 p-2 rounded">
                            <span className="block text-xs text-gray-500">Top Left</span>
                            {land.tf_latlng || "-"}
                        </div>
                        <div className="bg-gray-50 dark:bg-white/5 p-2 rounded">
                            <span className="block text-xs text-gray-500">Top Right</span>
                            {land.tr_latlng || "-"}
                        </div>
                        <div className="bg-gray-50 dark:bg-white/5 p-2 rounded">
                            <span className="block text-xs text-gray-500">Bottom Left</span>
                            {land.bl_latlng || "-"}
                        </div>
                        <div className="bg-gray-50 dark:bg-white/5 p-2 rounded">
                            <span className="block text-xs text-gray-500">Bottom Right</span>
                            {land.br_latlng || "-"}
                        </div>
                    </div>
                </div>

                {/* Section 3: Ownership Details */}
                <div>
                    <h4 className="font-semibold text-gray-700 dark:text-white/90 mb-2">Ownership: <span className="text-primary-600">{land.ownership_details}</span></h4>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        {land.ownership_details === 'LEASE' && (
                            <>
                                <div><Label>Relation</Label><div>{land.relation}</div></div>
                                <div><Label>Owner Name</Label><div>{land.owner_first_name} {land.surname}</div></div>
                                <div><Label>Lease Number</Label><div>{land.number}</div></div>
                            </>
                        )}
                        {land.ownership_details === 'ASSIGNED' && (
                            <div><Label>Relation</Label><div>{land.relation}</div></div>
                        )}
                    </div>

                    <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Attached Documents & Proofs</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {land.land_urls && Array.isArray(land.land_urls) && land.land_urls.map((url: string, i: number) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block p-2 border rounded hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
                                <span className="text-xs text-primary-500 mb-1 block">Land Photo {i + 1}</span>
                                <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-xs text-gray-400">View Image</div>
                            </a>
                        ))}

                        {/* Common Proofs */}
                        {land.passbook_image_url && (
                            <a href={land.passbook_image_url} target="_blank" rel="noopener noreferrer" className="block p-2 border rounded hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
                                <span className="text-xs text-primary-500 mb-1 block">Passbook</span>
                                <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-xs text-gray-400">View Image</div>
                            </a>
                        )}
                        {land.ec_certificate_url && (
                            <a href={land.ec_certificate_url} target="_blank" rel="noopener noreferrer" className="block p-2 border rounded hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
                                <span className="text-xs text-primary-500 mb-1 block">EC Certificate</span>
                                <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-xs text-gray-400">View Image</div>
                            </a>
                        )}
                        {land.ror_1b_url && (
                            <a href={land.ror_1b_url} target="_blank" rel="noopener noreferrer" className="block p-2 border rounded hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
                                <span className="text-xs text-primary-500 mb-1 block">ROR-1B</span>
                                <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-xs text-gray-400">View Image</div>
                            </a>
                        )}

                        {/* Lease Specific */}
                        {land.owner_noc_image_url && (
                            <a href={land.owner_noc_image_url} target="_blank" rel="noopener noreferrer" className="block p-2 border rounded hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
                                <span className="text-xs text-primary-500 mb-1 block">Owner NOC</span>
                                <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-xs text-gray-400">View Image</div>
                            </a>
                        )}

                        {/* Assigned Specific */}
                        {land.d_form_patta_image_url && (
                            <a href={land.d_form_patta_image_url} target="_blank" rel="noopener noreferrer" className="block p-2 border rounded hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
                                <span className="text-xs text-primary-500 mb-1 block">D-Form Patta</span>
                                <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-xs text-gray-400">View Image</div>
                            </a>
                        )}
                        {land.noc_image_url && (
                            <a href={land.noc_image_url} target="_blank" rel="noopener noreferrer" className="block p-2 border rounded hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
                                <span className="text-xs text-primary-500 mb-1 block">NOC</span>
                                <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-xs text-gray-400">View Image</div>
                            </a>
                        )}
                        {land.apc_image_url && (
                            <a href={land.apc_image_url} target="_blank" rel="noopener noreferrer" className="block p-2 border rounded hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
                                <span className="text-xs text-primary-500 mb-1 block">APC</span>
                                <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-xs text-gray-400">View Image</div>
                            </a>
                        )}
                    </div>
                </div>

                {/* Section 4: Approval Status */}
                <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-700 dark:text-white/90 mb-2">Approval History</h4>
                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Current Status:</span>
                            <span className="font-medium text-gray-800 dark:text-white">{land.status}</span>
                        </div>
                        {land.ao_reason && (
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">AO Remarks:</span>
                                <span className="font-medium text-gray-800 dark:text-white">{land.ao_reason}</span>
                            </div>
                        )}
                        {land.admin_reason && (
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Admin Remarks:</span>
                                <span className="font-medium text-gray-800 dark:text-white">{land.admin_reason}</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </Modal>
    );
}
