import { useState } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { createFarmerStep1, updateFarmerStep2, updateFarmerStep3 } from "../../services/userService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AddFarmerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddFarmerModal({ isOpen, onClose }: AddFarmerModalProps) {
    const [step, setStep] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
    const [uniqueId, setUniqueId] = useState<string | null>(null);

    const [step1Data, setStep1Data] = useState({
        first_name: "",
        last_name: "",
        surname: "",
        phone_number: "",
        email: "",
        gender: "Male",
        date_of_birth: "",
    });

    const [step2Data, setStep2Data] = useState({
        aadhar_card_number: "",
        aadhar_front_url: "http://example.com",
        aadhar_back_url: "http://example.com",
        pincode: "",
        district: "",
        mandal: "",
        village: "",
        state: "",
    });

    const [step3Data, setStep3Data] = useState({
        account_number: "",
        ifsc_code: "",
        bank_name: "",
        bank_branch: "",
        account_holder_name: "",
        pan_card_number: "",
        pancard_url: "http://example.com",
        agreement_form_url: "http://example.com",
        user_photo_url: "http://example.com",
    });

    const queryClient = useQueryClient();

    // Mutation for Step 1
    const mutationStep1 = useMutation({
        mutationFn: createFarmerStep1,
        onSuccess: (data) => {
            setUniqueId(data.unique_id);
            setPhoneNumber(data.phone_number);
            setStep(2);
        },
        onError: (error) => {
            console.error("Failed Step 1", error);
            alert("Failed to create Farmer (Step 1)");
        }
    });

    // Mutation for Step 2
    const mutationStep2 = useMutation({
        mutationFn: (data: any) => updateFarmerStep2(phoneNumber!, data),
        onSuccess: () => {
            setStep(3);
        },
        onError: (error) => {
            console.error("Failed Step 2", error);
            alert("Failed to update Farmer (Step 2)");
        }
    });

    // Mutation for Step 3
    const mutationStep3 = useMutation({
        mutationFn: (data: any) => updateFarmerStep3(phoneNumber!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["farmers"] });
            onClose();
            // Reset
            setStep(1);
            setUniqueId(null);
            setPhoneNumber(null);
        },
        onError: (error) => {
            console.error("Failed Step 3", error);
            alert("Failed to update Farmer (Step 3)");
        }
    });

    const handleStep1Submit = (e: React.FormEvent) => {
        e.preventDefault();
        mutationStep1.mutate(step1Data);
    };

    const handleStep2Submit = (e: React.FormEvent) => {
        e.preventDefault();
        mutationStep2.mutate(step2Data);
    };

    const handleStep3Submit = (e: React.FormEvent) => {
        e.preventDefault();
        mutationStep3.mutate(step3Data);
    };

    const handleInput1 = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setStep1Data({ ...step1Data, [e.target.name]: e.target.value });
    };
    const handleInput2 = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStep2Data({ ...step2Data, [e.target.name]: e.target.value });
    };
    const handleInput3 = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStep3Data({ ...step3Data, [e.target.name]: e.target.value });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl p-6">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    Add Farmer - Step {step} of 3
                </h3>
            </div>

            {step === 1 && (
                <form onSubmit={handleStep1Submit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-3 gap-4">
                        <div><Label>First Name *</Label><Input name="first_name" value={step1Data.first_name} onChange={handleInput1} required /></div>
                        <div><Label>Last Name *</Label><Input name="last_name" value={step1Data.last_name} onChange={handleInput1} required /></div>
                        <div><Label>Surname *</Label><Input name="surname" value={step1Data.surname} onChange={handleInput1} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Phone *</Label><Input name="phone_number" value={step1Data.phone_number} onChange={handleInput1} required /></div>
                        <div><Label>Email *</Label><Input name="email" type="email" value={step1Data.email} onChange={handleInput1} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Gender *</Label>
                            <select name="gender" value={step1Data.gender} onChange={handleInput1} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-white/[0.03] dark:text-white/90">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div><Label>DOB *</Label><Input name="date_of_birth" type="date" value={step1Data.date_of_birth} onChange={handleInput1} required /></div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
                        <Button disabled={mutationStep1.isPending}>{mutationStep1.isPending ? "Saving..." : "Next"}</Button>
                    </div>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleStep2Submit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Aadhar Number *</Label><Input name="aadhar_card_number" value={step2Data.aadhar_card_number} onChange={handleInput2} required /></div>
                        <div><Label>Aadhar Front URL *</Label><Input name="aadhar_front_url" value={step2Data.aadhar_front_url} onChange={handleInput2} required /></div>
                        <div><Label>Aadhar Back URL *</Label><Input name="aadhar_back_url" value={step2Data.aadhar_back_url} onChange={handleInput2} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Pincode *</Label><Input name="pincode" value={step2Data.pincode} onChange={handleInput2} required /></div>
                        <div><Label>District *</Label><Input name="district" value={step2Data.district} onChange={handleInput2} required /></div>
                        <div><Label>Mandal *</Label><Input name="mandal" value={step2Data.mandal} onChange={handleInput2} required /></div>
                        <div><Label>Village *</Label><Input name="village" value={step2Data.village} onChange={handleInput2} required /></div>
                        <div><Label>State *</Label><Input name="state" value={step2Data.state} onChange={handleInput2} required /></div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <Button disabled={mutationStep2.isPending}>{mutationStep2.isPending ? "Saving..." : "Next"}</Button>
                    </div>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={handleStep3Submit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Account Number *</Label><Input name="account_number" value={step3Data.account_number} onChange={handleInput3} required /></div>
                        <div><Label>IFSC Code *</Label><Input name="ifsc_code" value={step3Data.ifsc_code} onChange={handleInput3} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Bank Name *</Label><Input name="bank_name" value={step3Data.bank_name} onChange={handleInput3} required /></div>
                        <div><Label>Branch Name *</Label><Input name="bank_branch" value={step3Data.bank_branch} onChange={handleInput3} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Account Holder *</Label><Input name="account_holder_name" value={step3Data.account_holder_name} onChange={handleInput3} required /></div>
                        <div><Label>PAN Card Number *</Label><Input name="pan_card_number" value={step3Data.pan_card_number} onChange={handleInput3} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>PAN Image URL *</Label><Input name="pancard_url" value={step3Data.pancard_url} onChange={handleInput3} required /></div>
                        <div><Label>Agreement URL *</Label><Input name="agreement_form_url" value={step3Data.agreement_form_url} onChange={handleInput3} required /></div>
                        <div><Label>Photo URL *</Label><Input name="user_photo_url" value={step3Data.user_photo_url} onChange={handleInput3} required /></div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <Button disabled={mutationStep3.isPending}>{mutationStep3.isPending ? "Finish" : "Complete"}</Button>
                    </div>
                </form>
            )}
        </Modal>
    );
}
