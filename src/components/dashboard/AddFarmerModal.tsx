import { useState } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { createFarmerStep1, updateFarmerStep2 } from "../../services/userService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AddFarmerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddFarmerModal({ isOpen, onClose }: AddFarmerModalProps) {
    const [step, setStep] = useState(1);
    const [uniqueId, setUniqueId] = useState<string | null>(null);

    const [step1Data, setStep1Data] = useState({
        first_name: "",
        last_name: "",
        surname: "",
        phone_number: "",
        email: "",
        gender: "Male",
        date_of_birth: "",
        pincode: "",
        district: "",
        mandal: "",
        village: "",
        state: "",
        alternate_phone_number: "",
    });

    const [step2Data, setStep2Data] = useState({
        aadhar_card_number: "",
        aadhar_front_url: "http://example.com",
        aadhar_back_url: "http://example.com",
        pancard_url: "http://example.com",
        bank_name: "",
        account_number: "",
        ifsc_code: "",
    });

    const queryClient = useQueryClient();

    // Mutation for Step 1
    const mutationStep1 = useMutation({
        mutationFn: createFarmerStep1,
        onSuccess: (data) => {
            setUniqueId(data.unique_id);
            setStep(2);
            alert(`Farmer Created with ID: ${data.unique_id}. Proceed to Step 2.`);
        },
        onError: (error) => {
            console.error("Failed Step 1", error);
            alert("Failed to create Farmer (Step 1)");
        }
    });

    // Mutation for Step 2
    const mutationStep2 = useMutation({
        mutationFn: (data: any) => updateFarmerStep2(uniqueId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["farmers"] });
            onClose();
            // Reset
            setStep(1);
            setUniqueId(null);
            setStep1Data({ ...step1Data, phone_number: '', email: '' }); // basic reset
        },
        onError: (error) => {
            console.error("Failed Step 2", error);
            alert("Failed to update Farmer (Step 2)");
        }
    });

    const handleStep1Submit = (e: React.FormEvent) => {
        e.preventDefault();
        mutationStep1.mutate(step1Data);
    };

    const handleStep2Submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!uniqueId) return;
        mutationStep2.mutate(step2Data);
    };

    const handleInput1 = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setStep1Data({ ...step1Data, [e.target.name]: e.target.value });
    };
    const handleInput2 = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStep2Data({ ...step2Data, [e.target.name]: e.target.value });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl p-6">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    Add Farmer - Step {step} of 2
                </h3>
                <div className="text-sm text-gray-500">
                    {step === 1 ? "Personal Details" : "KYC & Bank Details"}
                </div>
            </div>

            {step === 1 && (
                <form onSubmit={handleStep1Submit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-3 gap-4">
                        <div><Label>First Name *</Label><Input name="first_name" value={step1Data.first_name} onChange={handleInput1} required /></div>
                        <div><Label>Last Name *</Label><Input name="last_name" value={step1Data.last_name} onChange={handleInput1} required /></div>
                        <div><Label>Surname *</Label><Input name="surname" value={step1Data.surname} onChange={handleInput1} required /></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div><Label>Phone *</Label><Input name="phone_number" value={step1Data.phone_number} onChange={handleInput1} required /></div>
                        <div><Label>Email *</Label><Input name="email" type="email" value={step1Data.email} onChange={handleInput1} required /></div>
                        <div><Label>Alt Phone</Label><Input name="alternate_phone_number" value={step1Data.alternate_phone_number} onChange={handleInput1} /></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label>Gender *</Label>
                            <div className="relative">
                                <select name="gender" value={step1Data.gender} onChange={handleInput1} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-white/[0.03] dark:text-white/90">
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div><Label>DOB *</Label><Input name="date_of_birth" type="date" value={step1Data.date_of_birth} onChange={handleInput1} required /></div>
                    </div>

                    <h4 className="font-medium text-gray-700 mt-2">Address</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>State *</Label><Input name="state" value={step1Data.state} onChange={handleInput1} required /></div>
                        <div><Label>District *</Label><Input name="district" value={step1Data.district} onChange={handleInput1} required /></div>
                        <div><Label>Mandal *</Label><Input name="mandal" value={step1Data.mandal} onChange={handleInput1} required /></div>
                        <div><Label>Village *</Label><Input name="village" value={step1Data.village} onChange={handleInput1} required /></div>
                        <div><Label>Pincode *</Label><Input name="pincode" value={step1Data.pincode} onChange={handleInput1} required /></div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
                        <Button disabled={mutationStep1.isPending}>
                            {mutationStep1.isPending ? "Saving..." : "Next Step"}
                        </Button>
                    </div>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleStep2Submit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="bg-gray-50 p-3 rounded mb-2 dark:bg-gray-800">
                        <p className="text-sm">Adding details for Farmer ID: <span className="font-bold">{uniqueId}</span></p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Aadhar Number *</Label><Input name="aadhar_card_number" value={step2Data.aadhar_card_number} onChange={handleInput2} required /></div>
                        <div><Label>PAN Card URL *</Label><Input name="pancard_url" value={step2Data.pancard_url} onChange={handleInput2} required /></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Aadhar Front URL *</Label><Input name="aadhar_front_url" value={step2Data.aadhar_front_url} onChange={handleInput2} required /></div>
                        <div><Label>Aadhar Back URL *</Label><Input name="aadhar_back_url" value={step2Data.aadhar_back_url} onChange={handleInput2} required /></div>
                    </div>

                    <h4 className="font-medium text-gray-700 mt-2">Bank Details</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <div><Label>Bank Name *</Label><Input name="bank_name" value={step2Data.bank_name} onChange={handleInput2} required /></div>
                        <div><Label>Account Number *</Label><Input name="account_number" value={step2Data.account_number} onChange={handleInput2} required /></div>
                        <div><Label>IFSC Code *</Label><Input name="ifsc_code" value={step2Data.ifsc_code} onChange={handleInput2} required /></div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <Button disabled={mutationStep2.isPending}>
                            {mutationStep2.isPending ? "Finishing..." : "Complete Registration"}
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
}
