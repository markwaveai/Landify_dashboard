import { useState } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { createFarmerStep1, updateFarmerStep2, updateFarmerStep3 } from "../../services/userService";
import { addLandStep1, addLandStep2 } from "../../services/landService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../context/SnackbarContext";

interface AddFarmerModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialStep?: number;
    initialData?: any;
}

export default function AddFarmerModal({ isOpen, onClose, initialStep, initialData }: AddFarmerModalProps) {
    const { showSnackbar } = useSnackbar();
    const queryClient = useQueryClient();

    // Global State
    const [step, setStep] = useState(initialStep || 1);
    const [uniqueId, setUniqueId] = useState<string | null>(initialData?.unique_id || null);
    const [landId, setLandId] = useState<number | null>(null);

    // --- State: Farmer Step 1 ---
    const [farmerStep1Data, setFarmerStep1Data] = useState({
        first_name: initialData?.first_name || "",
        last_name: initialData?.last_name || "",
        surname: initialData?.surname || "",
        phone_number: initialData?.phone_number || "",
        email: initialData?.email || "",
        gender: initialData?.gender || "Male",
        date_of_birth: initialData?.date_of_birth || "",
        district: initialData?.district || "",
        mandal: initialData?.mandal || "",
        village: initialData?.village || "",
        pincode: initialData?.pincode || "",
        state: initialData?.state || "Andhra Pradesh",
        alternate_phone_number: initialData?.alternate_phone_number || "",
        is_step1_completed: true
    });

    // --- State: Farmer Step 2 ---
    const [farmerStep2Data, setFarmerStep2Data] = useState({
        aadhar_card_number: initialData?.aadhar_card_number || "",
        aadhar_front_url: initialData?.aadhar_front_url || "http://example.com",
        aadhar_back_url: initialData?.aadhar_back_url || "http://example.com",
        passbook_number: initialData?.passbook_number || "",
        passbook_url: initialData?.passbook_url || "http://example.com/pb",
        user_photo_url: initialData?.user_photo_url || "http://example.com/photo",
        is_step2_completed: true
    });

    // --- State: Land Step 1 (Wizard Step 3) ---
    const [landStep1Data, setLandStep1Data] = useState({
        survey_no: "",
        area_in_acres: 2.0,
        land_urls: ["", "", "", ""],
        tf_latlng: "",
        tr_latlng: "",
        br_latlng: "",
        bl_latlng: "",
    });

    // --- State: Land Step 2 (Wizard Step 4) ---
    const [landStep2Data, setLandStep2Data] = useState({
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

    // --- State: Farmer Step 3 (Wizard Step 5) ---
    const [farmerStep3Data, setFarmerStep3Data] = useState({
        account_number: initialData?.account_number || "",
        ifsc_code: initialData?.ifsc_code || "",
        bank_name: initialData?.bank_name || "",
        bank_branch: initialData?.bank_branch || "",
        account_holder_name: initialData?.account_holder_name || "",
        pancard_url: initialData?.pancard_url || "http://example.com",
        agreement_form_url: initialData?.agreement_form_url || "http://example.com",
        is_step3_completed: true,
    });


    // --- Mutations ---

    // 1. Farmer Step 1
    const mutationStep1 = useMutation({
        mutationFn: createFarmerStep1,
        onSuccess: (data) => {
            setUniqueId(data.unique_id);
            // Also update phone number in state if it wasn't there (for Land steps)
            // But we have it in farmerStep1Data
            setStep(2);
        },
        onError: (error: any) => {
            console.error("Failed Farmer Step 1", error);
            showSnackbar(error.response?.data?.detail || "Failed to create Farmer (Step 1)", "error");
        }
    });

    // 2. Farmer Step 2
    const mutationStep2 = useMutation({
        mutationFn: (data: any) => updateFarmerStep2(uniqueId!, data),
        onSuccess: () => {
            setStep(3); // Go to Land Step 1
        },
        onError: (error: any) => {
            console.error("Failed Farmer Step 2", error);
            showSnackbar(error.response?.data?.detail || "Failed to update Farmer (Step 2)", "error");
        }
    });

    // 3. Land Step 1
    const mutationLandStep1 = useMutation({
        mutationFn: (data: any) => addLandStep1(farmerStep1Data.phone_number, data),
        onSuccess: (data) => {
            setLandId(data.id);
            setStep(4); // Go to Land Step 2
        },
        onError: (error: any) => {
            console.error("Failed Land Step 1", error);
            showSnackbar(error.response?.data?.detail || "Failed to add Land (Step 1)", "error");
        }
    });

    // 4. Land Step 2
    const mutationLandStep2 = useMutation({
        mutationFn: (data: any) => addLandStep2(landId!, data),
        onSuccess: () => {
            showSnackbar("Land details added successfully!", "success");
            setStep(5); // Go to Farmer Step 3 (Bank)
        },
        onError: (error: any) => {
            console.error("Failed Land Step 2", error);
            showSnackbar("Failed to add Land ownership proofs", "error");
        }
    });

    // 5. Farmer Step 3
    const mutationStep3 = useMutation({
        mutationFn: (data: any) => updateFarmerStep3(uniqueId!, data),
        onSuccess: () => {
            showSnackbar("Farmer onboarding complete!", "success");
            queryClient.invalidateQueries({ queryKey: ["farmers"] });
            onClose();
            // Reset
            setStep(1);
            setUniqueId(null);
            setLandId(null);
        },
        onError: (error: any) => {
            console.error("Failed Farmer Step 3", error);
            showSnackbar(error.response?.data?.detail || "Failed to update Farmer (Step 3)", "error");
        }
    });

    // --- Handlers ---

    const handleStep1Submit = (e: React.FormEvent) => {
        e.preventDefault();
        mutationStep1.mutate(farmerStep1Data);
    };

    const handleStep2Submit = (e: React.FormEvent) => {
        e.preventDefault();
        mutationStep2.mutate(farmerStep2Data);
    };

    const handleLandStep1Submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Filter out empty URLs
        const validUrls = landStep1Data.land_urls.filter(url => url.trim() !== "");
        if (validUrls.length < 4) {
            showSnackbar("Please provide at least 4 valid land image URLs.", "warning");
            return;
        }
        mutationLandStep1.mutate({
            ...landStep1Data,
            land_urls: validUrls,
            is_step1_completed: false
        });
    };

    const handleLandStep2Submit = (e: React.FormEvent) => {
        e.preventDefault();
        const commonData = {
            land_type: landStep2Data.land_type,
            water_source: landStep2Data.water_source,
            ownership_details: landStep2Data.ownership_details,
            district: landStep2Data.district,
            mandal: landStep2Data.mandal,
            village: landStep2Data.village,
            passbook_number: landStep2Data.passbook_number,
            passbook_image_url: landStep2Data.passbook_image_url || null,
            ec_certificate_url: landStep2Data.ec_certificate_url || null,
            ror_1b_url: landStep2Data.ror_1b_url || null,
            is_step2_completed: true
        };

        let payload: any = { ...commonData };

        if (landStep2Data.ownership_details === "LEASE") {
            payload = {
                ...payload,
                owner_name: landStep2Data.owner_name,
                owner_aadhar_number: landStep2Data.owner_aadhar_number,
                owner_noc_image_url: landStep2Data.owner_noc_image_url || null,
            };
        } else if (landStep2Data.ownership_details === "ASSIGNED") {
            payload = {
                ...payload,
                owner_noc_image_url: landStep2Data.owner_noc_image_url || null,
                apc_image_url: landStep2Data.apc_image_url || null,
            };
        }

        // Clean empty strings to null
        const cleanedPayload = Object.fromEntries(
            Object.entries(payload).map(([key, value]) => [key, value === "" ? null : value])
        );

        mutationLandStep2.mutate(cleanedPayload);
    };

    const handleStep3Submit = (e: React.FormEvent) => {
        e.preventDefault();
        mutationStep3.mutate(farmerStep3Data);
    };

    // Input Handlers

    const handleFarmerInput1 = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFarmerStep1Data({ ...farmerStep1Data, [e.target.name]: e.target.value });
    };
    const handleFarmerInput2 = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFarmerStep2Data({ ...farmerStep2Data, [e.target.name]: e.target.value });
    };
    const handleLandInput1 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.type === "number" ? parseFloat(e.target.value) : e.target.value;
        setLandStep1Data({ ...landStep1Data, [e.target.name]: val });
    };
    const handleLandUrlChange = (index: number, value: string) => {
        const newUrls = [...landStep1Data.land_urls];
        newUrls[index] = value;
        setLandStep1Data({ ...landStep1Data, land_urls: newUrls });
    };
    const handleLandInput2 = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setLandStep2Data({ ...landStep2Data, [e.target.name]: e.target.value });
    };
    const handleFarmerInput3 = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFarmerStep3Data({ ...farmerStep3Data, [e.target.name]: e.target.value });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl p-6">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    Onboard Farmer - Step {step} of 5
                </h3>
            </div>

            {/* --- Step 1: Farmer Basic Form --- */}
            {step === 1 && (
                <form onSubmit={handleStep1Submit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <p className="text-sm font-semibold text-brand-500">Farmer Personal Data</p>
                    <div className="grid grid-cols-3 gap-4">
                        <div><Label>First Name *</Label><Input name="first_name" value={farmerStep1Data.first_name} onChange={handleFarmerInput1} required /></div>
                        <div><Label>Last Name *</Label><Input name="last_name" value={farmerStep1Data.last_name} onChange={handleFarmerInput1} required /></div>
                        <div><Label>Surname *</Label><Input name="surname" value={farmerStep1Data.surname} onChange={handleFarmerInput1} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Phone *</Label><Input name="phone_number" value={farmerStep1Data.phone_number} onChange={handleFarmerInput1} required /></div>
                        <div><Label>Email *</Label><Input name="email" type="email" value={farmerStep1Data.email} onChange={handleFarmerInput1} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Gender *</Label>
                            <select name="gender" value={farmerStep1Data.gender} onChange={handleFarmerInput1} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-white/[0.03] dark:text-white/90">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div><Label>DOB *</Label><Input name="date_of_birth" type="date" value={farmerStep1Data.date_of_birth} onChange={handleFarmerInput1} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>District *</Label><Input name="district" value={farmerStep1Data.district} onChange={handleFarmerInput1} required /></div>
                        <div><Label>Mandal *</Label><Input name="mandal" value={farmerStep1Data.mandal} onChange={handleFarmerInput1} required /></div>
                        <div><Label>Village *</Label><Input name="village" value={farmerStep1Data.village} onChange={handleFarmerInput1} required /></div>
                        <div><Label>Pincode *</Label><Input name="pincode" value={farmerStep1Data.pincode} onChange={handleFarmerInput1} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>State *</Label><Input name="state" value={farmerStep1Data.state} onChange={handleFarmerInput1} required /></div>
                        <div><Label>Alternate Phone</Label><Input name="alternate_phone_number" value={farmerStep1Data.alternate_phone_number} onChange={handleFarmerInput1} /></div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
                        <Button disabled={mutationStep1.isPending}>{mutationStep1.isPending ? "Saving..." : "Next"}</Button>
                    </div>
                </form>
            )}

            {/* --- Step 2: Farmer KYC Form --- */}
            {step === 2 && (
                <form onSubmit={handleStep2Submit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <p className="text-sm font-semibold text-brand-500">Farmer KYC</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Aadhar Number *</Label><Input name="aadhar_card_number" value={farmerStep2Data.aadhar_card_number} onChange={handleFarmerInput2} required /></div>
                        <div><Label>Passbook Number</Label><Input name="passbook_number" value={farmerStep2Data.passbook_number} onChange={handleFarmerInput2} /></div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div><Label>Aadhar Front URL *</Label><Input name="aadhar_front_url" value={farmerStep2Data.aadhar_front_url} onChange={handleFarmerInput2} required /></div>
                        <div><Label>Aadhar Back URL *</Label><Input name="aadhar_back_url" value={farmerStep2Data.aadhar_back_url} onChange={handleFarmerInput2} required /></div>
                        <div><Label>Passbook URL</Label><Input name="passbook_url" value={farmerStep2Data.passbook_url} onChange={handleFarmerInput2} /></div>
                        <div><Label>User Photo URL</Label><Input name="user_photo_url" value={farmerStep2Data.user_photo_url} onChange={handleFarmerInput2} /></div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <Button disabled={mutationStep2.isPending}>{mutationStep2.isPending ? "Saving..." : "Next"}</Button>
                    </div>
                </form>
            )}

            {/* --- Step 3: Land Step 1 Form --- */}
            {step === 3 && (
                <form onSubmit={handleLandStep1Submit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <p className="text-sm font-semibold text-brand-500">Land Details</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Survey No *</Label><Input name="survey_no" value={landStep1Data.survey_no} onChange={handleLandInput1} required /></div>
                        <div><Label>Area (Acres) *</Label><Input name="area_in_acres" type="number" step={0.1} value={landStep1Data.area_in_acres} onChange={handleLandInput1} required /></div>
                    </div>

                    <h4 className="font-medium text-gray-700 mt-2">Land Images (4) *</h4>
                    <div className="grid grid-cols-2 gap-4">
                        {landStep1Data.land_urls.map((url, index) => (
                            <div key={index}>
                                <Label>Land URL {index + 1}</Label>
                                <Input
                                    placeholder={`Land URL ${index + 1}`}
                                    value={url}
                                    onChange={(e) => handleLandUrlChange(index, e.target.value)}
                                    required
                                />
                            </div>
                        ))}
                    </div>

                    <h4 className="font-medium text-gray-700 mt-2">Coordinates (LatLng)</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Top Left</Label><Input name="tf_latlng" placeholder="17.1, 78.1" value={landStep1Data.tf_latlng} onChange={handleLandInput1} /></div>
                        <div><Label>Top Right</Label><Input name="tr_latlng" placeholder="17.1, 78.2" value={landStep1Data.tr_latlng} onChange={handleLandInput1} /></div>
                        <div><Label>Bottom Left</Label><Input name="bl_latlng" placeholder="17.0, 78.1" value={landStep1Data.bl_latlng} onChange={handleLandInput1} /></div>
                        <div><Label>Bottom Right</Label><Input name="br_latlng" placeholder="17.0, 78.2" value={landStep1Data.br_latlng} onChange={handleLandInput1} /></div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <Button disabled={mutationLandStep1.isPending}>{mutationLandStep1.isPending ? "Saving..." : "Next"}</Button>
                    </div>
                </form>
            )}

            {/* --- Step 4: Land Step 2 Form --- */}
            {step === 4 && (
                <form onSubmit={handleLandStep2Submit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <p className="text-sm font-semibold text-brand-500">Land Ownership</p>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label>Land Type</Label>
                            <select name="land_type" value={landStep2Data.land_type} onChange={handleLandInput2} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-white/[0.03]">
                                <option value="Wet Land">Wet Land</option>
                                <option value="Dry Land">Dry Land</option>
                            </select>
                        </div>
                        <div>
                            <Label>Water Source</Label>
                            <select name="water_source" value={landStep2Data.water_source} onChange={handleLandInput2} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-white/[0.03]">
                                <option value="Borewell">Borewell</option>
                                <option value="Canal">Canal</option>
                                <option value="Rainfed">Rainfed</option>
                            </select>
                        </div>
                        <div>
                            <Label>Ownership</Label>
                            <select name="ownership_details" value={landStep2Data.ownership_details} onChange={handleLandInput2} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-white/[0.03]">
                                <option value="OWNER">Owner</option>
                                <option value="LEASE">Lease</option>
                                <option value="ASSIGNED">Assigned</option>
                            </select>
                        </div>
                    </div>

                    <h4 className="font-medium text-gray-700 mt-2">Location Details</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <div><Label>District</Label><Input name="district" value={landStep2Data.district} onChange={handleLandInput2} /></div>
                        <div><Label>Mandal</Label><Input name="mandal" value={landStep2Data.mandal} onChange={handleLandInput2} /></div>
                        <div><Label>Village</Label><Input name="village" value={landStep2Data.village} onChange={handleLandInput2} /></div>
                    </div>

                    <h4 className="font-medium text-gray-700 mt-2">Ownership Details & Proofs</h4>

                    {landStep2Data.ownership_details === "OWNER" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Passbook No</Label><Input name="passbook_number" value={landStep2Data.passbook_number} onChange={handleLandInput2} /></div>
                            <div><Label>Passbook Image URL</Label><Input name="passbook_image_url" value={landStep2Data.passbook_image_url} onChange={handleLandInput2} /></div>
                            <div><Label>EC Certificate URL</Label><Input name="ec_certificate_url" value={landStep2Data.ec_certificate_url} onChange={handleLandInput2} /></div>
                            <div><Label>ROR-1B URL</Label><Input name="ror_1b_url" value={landStep2Data.ror_1b_url} onChange={handleLandInput2} /></div>
                        </div>
                    )}

                    {landStep2Data.ownership_details === "LEASE" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Owner Name</Label><Input name="owner_name" value={landStep2Data.owner_name} onChange={handleLandInput2} /></div>
                                <div><Label>Owner Aadhar Number</Label><Input name="owner_aadhar_number" value={landStep2Data.owner_aadhar_number} onChange={handleLandInput2} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Passbook No</Label><Input name="passbook_number" value={landStep2Data.passbook_number} onChange={handleLandInput2} /></div>
                                <div><Label>Passbook Image URL</Label><Input name="passbook_image_url" value={landStep2Data.passbook_image_url} onChange={handleLandInput2} /></div>
                                <div><Label>EC Certificate Image URL</Label><Input name="ec_certificate_url" value={landStep2Data.ec_certificate_url} onChange={handleLandInput2} /></div>
                                <div><Label>ROR-1B Image URL</Label><Input name="ror_1b_url" value={landStep2Data.ror_1b_url} onChange={handleLandInput2} /></div>
                                <div className="col-span-2"><Label>Owner NOC Image URL</Label><Input name="owner_noc_image_url" value={landStep2Data.owner_noc_image_url} onChange={handleLandInput2} /></div>
                            </div>
                        </div>
                    )}

                    {landStep2Data.ownership_details === "ASSIGNED" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Passbook No</Label><Input name="passbook_number" value={landStep2Data.passbook_number} onChange={handleLandInput2} /></div>
                                <div><Label>Passbook Image URL</Label><Input name="passbook_image_url" value={landStep2Data.passbook_image_url} onChange={handleLandInput2} /></div>
                                <div><Label>EC Certificate URL</Label><Input name="ec_certificate_url" value={landStep2Data.ec_certificate_url} onChange={handleLandInput2} /></div>
                                <div><Label>ROR-1B URL</Label><Input name="ror_1b_url" value={landStep2Data.ror_1b_url} onChange={handleLandInput2} /></div>
                                <div><Label>Owner NOC Image URL</Label><Input name="owner_noc_image_url" value={landStep2Data.owner_noc_image_url} onChange={handleLandInput2} /></div>
                                <div><Label>APC Image URL</Label><Input name="apc_image_url" value={landStep2Data.apc_image_url} onChange={handleLandInput2} /></div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <Button disabled={mutationLandStep2.isPending}>{mutationLandStep2.isPending ? "Saving..." : "Next"}</Button>
                    </div>
                </form>
            )}


            {/* --- Step 5: Farmer Bank Form --- */}
            {step === 5 && (
                <form onSubmit={handleStep3Submit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <p className="text-sm font-semibold text-brand-500">Farmer Bank Details</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Account Number *</Label><Input name="account_number" value={farmerStep3Data.account_number} onChange={handleFarmerInput3} required /></div>
                        <div><Label>IFSC Code *</Label><Input name="ifsc_code" value={farmerStep3Data.ifsc_code} onChange={handleFarmerInput3} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Bank Name *</Label><Input name="bank_name" value={farmerStep3Data.bank_name} onChange={handleFarmerInput3} required /></div>
                        <div><Label>Branch Name *</Label><Input name="bank_branch" value={farmerStep3Data.bank_branch} onChange={handleFarmerInput3} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Account Holder *</Label><Input name="account_holder_name" value={farmerStep3Data.account_holder_name} onChange={handleFarmerInput3} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>PAN Image URL</Label><Input name="pancard_url" value={farmerStep3Data.pancard_url} onChange={handleFarmerInput3} /></div>
                        <div><Label>Agreement URL</Label><Input name="agreement_form_url" value={farmerStep3Data.agreement_form_url} onChange={handleFarmerInput3} /></div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <Button disabled={mutationStep3.isPending}>{mutationStep3.isPending ? "Finishing..." : "Complete Onboarding"}</Button>
                    </div>
                </form>
            )}
        </Modal>
    );
}
