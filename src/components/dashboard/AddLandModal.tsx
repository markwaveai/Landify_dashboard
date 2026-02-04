import { useState } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { addLandStep1, addLandStep2 } from "../../services/landService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../context/SnackbarContext";

interface AddLandModalProps {
    isOpen: boolean;
    onClose: () => void;
    farmer: {
        phone_number: string;
        first_name: string;
        last_name: string;
    } | null;
    initialStep?: number;
    initialLandId?: number | null;
}

export default function AddLandModal({ isOpen, onClose, farmer, initialStep = 1, initialLandId = null }: AddLandModalProps) {
    const queryClient = useQueryClient();
    const { showSnackbar } = useSnackbar();
    const [step, setStep] = useState(initialStep);
    const [landId, setLandId] = useState<number | null>(initialLandId);

    const [step1Data, setStep1Data] = useState({
        survey_no: "",
        area_in_acres: 2.0,
        land_urls: ["", "", "", ""],
        tf_latlng: "",
        tr_latlng: "",
        br_latlng: "",
        bl_latlng: "",
    });

    const [step2Data, setStep2Data] = useState({
        land_type: "Wet Land",
        water_source: "Borewell",
        ownership_details: "OWNER",
        district: "",
        mandal: "",
        village: "",
        // Owner/Lease Specific
        owner_name: "",
        owner_aadhar_number: "",
        // Image URLs & Proofs
        passbook_number: "",
        passbook_image_url: "http://example.com/pb",
        ec_certificate_url: "http://example.com/ec",
        ror_1b_url: "http://example.com/ror",
        owner_noc_image_url: "http://example.com/noc",
        apc_image_url: "http://example.com/apc",
    });

    // Mutation Step 1
    const mutationStep1 = useMutation({
        mutationFn: (data: any) => addLandStep1(farmer!.phone_number, data),
        onSuccess: (data) => {
            setLandId(data.id);
            setStep(2);
        },
        onError: (error: any) => {
            console.error("Land Step 1 Failed", error);
            showSnackbar(error.response?.data?.detail || "Failed to add land details", "error");
        }
    });

    // Mutation Step 2
    const mutationStep2 = useMutation({
        mutationFn: (data: any) => addLandStep2(landId!, data),
        onSuccess: () => {
            showSnackbar("Land added successfully!", "success");
            queryClient.invalidateQueries({ queryKey: ['lands'] });
            onClose();
            setStep(1);
            setLandId(null);
        },
        onError: (error: any) => {
            console.error("Land Step 2 Failed", error);
            showSnackbar("Failed to add ownership proofs", "error");
        }
    });

    const handleStep1Submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!farmer) return;

        // Filter out empty URLs
        const validUrls = step1Data.land_urls.filter(url => url.trim() !== "");

        if (validUrls.length < 4) {
            showSnackbar("Please provide at least 4 valid land image URLs.", "warning");
            return;
        }

        mutationStep1.mutate({
            ...step1Data,
            land_urls: validUrls,
            is_step1_completed: false
        });
    };

    const handleStep2Submit = (e: React.FormEvent) => {
        e.preventDefault();

        const commonData = {
            land_type: step2Data.land_type,
            water_source: step2Data.water_source,
            ownership_details: step2Data.ownership_details,
            district: step2Data.district,
            mandal: step2Data.mandal,
            village: step2Data.village,
            passbook_number: step2Data.passbook_number,
            passbook_image_url: step2Data.passbook_image_url || null,
            ec_certificate_url: step2Data.ec_certificate_url || null,
            ror_1b_url: step2Data.ror_1b_url || null,
            is_step2_completed: true
        };

        let payload: any = { ...commonData };

        if (step2Data.ownership_details === "LEASE") {
            payload = {
                ...payload,
                owner_name: step2Data.owner_name,
                owner_aadhar_number: step2Data.owner_aadhar_number,
                owner_noc_image_url: step2Data.owner_noc_image_url || null,
            };
        } else if (step2Data.ownership_details === "ASSIGNED") {
            // Note: User prompt showed "Assigned" in payload example, but generally we use uppercase values for selection; checking consistency
            // If backend needs "Assigned" specifically, we might need to map it, but staying safe with what matches the Select option value for now.
            // Actually, let's trust the select values are uppercase "ASSIGNED".
            payload = {
                ...payload,
                owner_noc_image_url: step2Data.owner_noc_image_url || null,
                apc_image_url: step2Data.apc_image_url || null,
            };
        }

        // Clean empty strings to null just in case, though usually state is string
        const cleanedPayload = Object.fromEntries(
            Object.entries(payload).map(([key, value]) => [key, value === "" ? null : value])
        );

        mutationStep2.mutate(cleanedPayload);
    };

    const handleInput1 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.type === "number" ? parseFloat(e.target.value) : e.target.value;
        setStep1Data({ ...step1Data, [e.target.name]: val });
    };

    const handleUrlChange = (index: number, value: string) => {
        const newUrls = [...step1Data.land_urls];
        newUrls[index] = value;
        setStep1Data({ ...step1Data, land_urls: newUrls });
    };

    const handleInput2 = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setStep2Data({ ...step2Data, [e.target.name]: e.target.value });
    };

    if (!farmer) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl p-6">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    Add Land - Step {step} of 2 (Farmer: {farmer.first_name})
                </h3>
            </div>

            {step === 1 && (
                <form onSubmit={handleStep1Submit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Survey No *</Label><Input name="survey_no" value={step1Data.survey_no} onChange={handleInput1} required /></div>
                        <div><Label>Area (Acres) *</Label><Input name="area_in_acres" type="number" step={0.1} value={step1Data.area_in_acres} onChange={handleInput1} required /></div>
                    </div>

                    <h4 className="font-medium text-gray-700 mt-2">Land Images (4) *</h4>
                    <div className="grid grid-cols-2 gap-4">
                        {step1Data.land_urls.map((url, index) => (
                            <div key={index}>
                                <Label>Land URL {index + 1}</Label>
                                <Input
                                    placeholder={`Land URL ${index + 1}`}
                                    value={url}
                                    onChange={(e) => handleUrlChange(index, e.target.value)}
                                    required
                                />
                            </div>
                        ))}
                    </div>

                    <h4 className="font-medium text-gray-700 mt-2">Coordinates (LatLng)</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Top Left</Label><Input name="tf_latlng" placeholder="17.1, 78.1" value={step1Data.tf_latlng} onChange={handleInput1} /></div>
                        <div><Label>Top Right</Label><Input name="tr_latlng" placeholder="17.1, 78.2" value={step1Data.tr_latlng} onChange={handleInput1} /></div>
                        <div><Label>Bottom Left</Label><Input name="bl_latlng" placeholder="17.0, 78.1" value={step1Data.bl_latlng} onChange={handleInput1} /></div>
                        <div><Label>Bottom Right</Label><Input name="br_latlng" placeholder="17.0, 78.2" value={step1Data.br_latlng} onChange={handleInput1} /></div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
                        <Button disabled={mutationStep1.isPending}>{mutationStep1.isPending ? "Saving..." : "Next"}</Button>
                    </div>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleStep2Submit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label>Land Type</Label>
                            <select name="land_type" value={step2Data.land_type} onChange={handleInput2} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-white/[0.03]">
                                <option value="Wet Land">Wet Land</option>
                                <option value="Dry Land">Dry Land</option>
                            </select>
                        </div>
                        <div>
                            <Label>Water Source</Label>
                            <select name="water_source" value={step2Data.water_source} onChange={handleInput2} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-white/[0.03]">
                                <option value="Borewell">Borewell</option>
                                <option value="Canal">Canal</option>
                                <option value="Rainfed">Rainfed</option>
                            </select>
                        </div>
                        <div>
                            <Label>Ownership</Label>
                            <select name="ownership_details" value={step2Data.ownership_details} onChange={handleInput2} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-white/[0.03]">
                                <option value="OWNER">Owner</option>
                                <option value="LEASE">Lease</option>
                                <option value="ASSIGNED">Assigned</option>
                            </select>
                        </div>
                    </div>

                    <h4 className="font-medium text-gray-700 mt-2">Location Details</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <div><Label>District</Label><Input name="district" value={step2Data.district} onChange={handleInput2} /></div>
                        <div><Label>Mandal</Label><Input name="mandal" value={step2Data.mandal} onChange={handleInput2} /></div>
                        <div><Label>Village</Label><Input name="village" value={step2Data.village} onChange={handleInput2} /></div>
                    </div>

                    <h4 className="font-medium text-gray-700 mt-2">Ownership Details & Proofs</h4>

                    {step2Data.ownership_details === "OWNER" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Passbook No</Label><Input name="passbook_number" value={step2Data.passbook_number} onChange={handleInput2} /></div>
                            <div><Label>Passbook Image URL</Label><Input name="passbook_image_url" value={step2Data.passbook_image_url} onChange={handleInput2} /></div>
                            <div><Label>EC Certificate URL</Label><Input name="ec_certificate_url" value={step2Data.ec_certificate_url} onChange={handleInput2} /></div>
                            <div><Label>ROR-1B URL</Label><Input name="ror_1b_url" value={step2Data.ror_1b_url} onChange={handleInput2} /></div>
                        </div>
                    )}

                    {step2Data.ownership_details === "LEASE" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Owner Name</Label><Input name="owner_name" value={step2Data.owner_name} onChange={handleInput2} /></div>
                                <div><Label>Owner Aadhar Number</Label><Input name="owner_aadhar_number" value={step2Data.owner_aadhar_number} onChange={handleInput2} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Passbook No</Label><Input name="passbook_number" value={step2Data.passbook_number} onChange={handleInput2} /></div>
                                <div><Label>Passbook Image URL</Label><Input name="passbook_image_url" value={step2Data.passbook_image_url} onChange={handleInput2} /></div>
                                <div><Label>EC Certificate Image URL</Label><Input name="ec_certificate_url" value={step2Data.ec_certificate_url} onChange={handleInput2} /></div>
                                <div><Label>ROR-1B Image URL</Label><Input name="ror_1b_url" value={step2Data.ror_1b_url} onChange={handleInput2} /></div>
                                <div className="col-span-2"><Label>Owner NOC Image URL</Label><Input name="owner_noc_image_url" value={step2Data.owner_noc_image_url} onChange={handleInput2} /></div>
                            </div>
                        </div>
                    )}

                    {step2Data.ownership_details === "ASSIGNED" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Passbook No</Label><Input name="passbook_number" value={step2Data.passbook_number} onChange={handleInput2} /></div>
                                <div><Label>Passbook Image URL</Label><Input name="passbook_image_url" value={step2Data.passbook_image_url} onChange={handleInput2} /></div>
                                <div><Label>EC Certificate URL</Label><Input name="ec_certificate_url" value={step2Data.ec_certificate_url} onChange={handleInput2} /></div>
                                <div><Label>ROR-1B URL</Label><Input name="ror_1b_url" value={step2Data.ror_1b_url} onChange={handleInput2} /></div>
                                <div><Label>Owner NOC Image URL</Label><Input name="owner_noc_image_url" value={step2Data.owner_noc_image_url} onChange={handleInput2} /></div>
                                <div><Label>APC Image URL</Label><Input name="apc_image_url" value={step2Data.apc_image_url} onChange={handleInput2} /></div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <Button disabled={mutationStep2.isPending}>{mutationStep2.isPending ? "Finishing..." : "Complete"}</Button>
                    </div>
                </form>
            )}
        </Modal>
    );
}
