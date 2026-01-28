import { useState } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { addLandStep1, addLandStep2 } from "../../services/landService";
import { useMutation } from "@tanstack/react-query";

interface AddLandModalProps {
    isOpen: boolean;
    onClose: () => void;
    farmer: {
        phone_number: string;
        first_name: string;
        last_name: string;
    } | null;
}

export default function AddLandModal({ isOpen, onClose, farmer }: AddLandModalProps) {
    const [step, setStep] = useState(1);
    const [landId, setLandId] = useState<number | null>(null);

    const [step1Data, setStep1Data] = useState({
        survey_no: "",
        area_in_acres: 2.0,
        land_urls: ["http://ex.com/1", "http://ex.com/2", "http://ex.com/3"],
        tf_latlng: "",
        tr_latlng: "",
        br_latlng: "",
        bl_latlng: "",
    });

    const [step2Data, setStep2Data] = useState({
        land_type: "Wet Land",
        water_source: "Borewell",
        ownership_details: "OWNER",
        // Lease/Assigned Common
        relation: "",
        // Lease Specific
        number: "",
        date_of_birth: "",
        owner_first_name: "",
        owner_middle_name: "",
        surname: "",
        owner_noc_image_url: "http://example.com/noc",
        // Assigned Specific
        d_form_patta_image_url: "http://example.com/patta",
        noc_image_url: "http://example.com/noc",
        apc_image_url: "http://example.com/apc",
        // Common Proofs
        passbook_number: "",
        passbook_image_url: "http://example.com/pb",
        ec_number: "",
        ec_certificate_url: "http://example.com/ec",
        ror_1b_url: "http://example.com/ror",
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
            alert(error.response?.data?.detail || "Failed to add land details");
        }
    });

    // Mutation Step 2
    const mutationStep2 = useMutation({
        mutationFn: (data: any) => addLandStep2(landId!, data),
        onSuccess: () => {
            alert("Land added successfully!");
            onClose();
            setStep(1);
            setLandId(null);
        },
        onError: (error: any) => {
            console.error("Land Step 2 Failed", error);
            alert("Failed to add ownership proofs");
        }
    });

    const handleStep1Submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!farmer) return;
        mutationStep1.mutate(step1Data);
    };

    const handleStep2Submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Clean data: convert empty strings to null for optional fields
        const cleanedData = Object.fromEntries(
            Object.entries(step2Data).map(([key, value]) => [key, value === "" ? null : value])
        );
        mutationStep2.mutate(cleanedData);
    };

    const handleInput1 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.type === "number" ? parseFloat(e.target.value) : e.target.value;
        setStep1Data({ ...step1Data, [e.target.name]: val });
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

                    <h4 className="font-medium text-gray-700 mt-2">Ownership Details & Proofs</h4>

                    {step2Data.ownership_details === "OWNER" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Passbook No</Label><Input name="passbook_number" value={step2Data.passbook_number} onChange={handleInput2} /></div>
                            <div><Label>Passbook Image URL</Label><Input name="passbook_image_url" value={step2Data.passbook_image_url} onChange={handleInput2} /></div>
                            <div><Label>EC Number</Label><Input name="ec_number" value={step2Data.ec_number} onChange={handleInput2} /></div>
                            <div><Label>EC Certificate URL</Label><Input name="ec_certificate_url" value={step2Data.ec_certificate_url} onChange={handleInput2} /></div>
                            <div className="col-span-2"><Label>ROR-1B URL</Label><Input name="ror_1b_url" value={step2Data.ror_1b_url} onChange={handleInput2} /></div>
                        </div>
                    )}

                    {step2Data.ownership_details === "LEASE" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div><Label>Relation</Label><Input name="relation" value={step2Data.relation} onChange={handleInput2} /></div>
                                <div><Label>Number</Label><Input name="number" value={step2Data.number} onChange={handleInput2} /></div>
                                <div><Label>DOB</Label><Input name="date_of_birth" type="date" value={step2Data.date_of_birth} onChange={handleInput2} /></div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div><Label>First Name</Label><Input name="owner_first_name" value={step2Data.owner_first_name} onChange={handleInput2} /></div>
                                <div><Label>Middle Name</Label><Input name="owner_middle_name" value={step2Data.owner_middle_name} onChange={handleInput2} /></div>
                                <div><Label>Surname</Label><Input name="surname" value={step2Data.surname} onChange={handleInput2} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Passbook No</Label><Input name="passbook_number" value={step2Data.passbook_number} onChange={handleInput2} /></div>
                                <div><Label>Passbook Image URL</Label><Input name="passbook_image_url" value={step2Data.passbook_image_url} onChange={handleInput2} /></div>
                                <div><Label>EC Number</Label><Input name="ec_number" value={step2Data.ec_number} onChange={handleInput2} /></div>
                                <div><Label>EC Certificate Image URL</Label><Input name="ec_certificate_url" value={step2Data.ec_certificate_url} onChange={handleInput2} /></div>
                                <div><Label>Owner NOC Image URL</Label><Input name="owner_noc_image_url" value={step2Data.owner_noc_image_url} onChange={handleInput2} /></div>
                                <div><Label>ROR-1B Image URL</Label><Input name="ror_1b_url" value={step2Data.ror_1b_url} onChange={handleInput2} /></div>
                            </div>
                        </div>
                    )}

                    {step2Data.ownership_details === "ASSIGNED" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Relation</Label><Input name="relation" value={step2Data.relation} onChange={handleInput2} /></div>
                                <div><Label>D-Form Patta Image URL</Label><Input name="d_form_patta_image_url" value={step2Data.d_form_patta_image_url} onChange={handleInput2} /></div>
                                <div><Label>EC Certificate URL</Label><Input name="ec_certificate_url" value={step2Data.ec_certificate_url} onChange={handleInput2} /></div>
                                <div><Label>NOC Certificate URL</Label><Input name="noc_image_url" value={step2Data.noc_image_url} onChange={handleInput2} /></div>
                                <div className="col-span-2"><Label>Assignment Proceedings Certificate Image URL</Label><Input name="apc_image_url" value={step2Data.apc_image_url} onChange={handleInput2} /></div>
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
