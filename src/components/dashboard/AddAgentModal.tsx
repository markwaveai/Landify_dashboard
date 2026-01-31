import { useState } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { createAgentStep1, updateAgentStep2 } from "../../services/userService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AddAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddAgentModal({ isOpen, onClose }: AddAgentModalProps) {
    const [step, setStep] = useState(1);
    const [uniqueId, setUniqueId] = useState<string | null>(null);

    const [step1Data, setStep1Data] = useState({
        first_name: "",
        last_name: "",
        phone_number: "",
        email: "",
        date_of_birth: "",
        state: "",
        pincode: "",
        mandal: "",
        district: "",
        village: "",
        alternate_phone_number: "",
    });

    const [step2Data, setStep2Data] = useState({
        aadhar_card_number: "",
        aadhar_front_url: "http://example.com/front",
        aadhar_back_url: "http://example.com/back",
        pancard_url: "http://example.com/pan",
        user_photo_url: "http://example.com/photo",
    });

    const queryClient = useQueryClient();

    const mutationStep1 = useMutation({
        mutationFn: createAgentStep1,
        onSuccess: (data: any) => {
            setUniqueId(data.unique_id);
            setStep(2);
        },
        onError: (error) => {
            console.error("Failed Step 1", error);
            alert("Failed to create Agent (Step 1)");
        }
    });

    const mutationStep2 = useMutation({
        mutationFn: (data: any) => updateAgentStep2(uniqueId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["agents"] });
            onClose();
            // Reset
            setStep(1);
            setUniqueId(null);
        },
        onError: (error) => {
            console.error("Failed Step 2", error);
            alert("Failed to update Agent (Step 2)");
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

    const handleInput1 = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStep1Data({ ...step1Data, [e.target.name]: e.target.value });
    };

    const handleInput2 = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStep2Data({ ...step2Data, [e.target.name]: e.target.value });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl p-6">
            <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">
                Add Agent - Step {step} of 2
            </h3>

            {step === 1 && (
                <form onSubmit={handleStep1Submit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>First Name *</Label><Input name="first_name" value={step1Data.first_name} onChange={handleInput1} required /></div>
                        <div><Label>Last Name *</Label><Input name="last_name" value={step1Data.last_name} onChange={handleInput1} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Phone *</Label><Input name="phone_number" value={step1Data.phone_number} onChange={handleInput1} required /></div>
                        <div><Label>Email *</Label><Input name="email" type="email" value={step1Data.email} onChange={handleInput1} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>DOB *</Label><Input name="date_of_birth" type="date" value={step1Data.date_of_birth} onChange={handleInput1} required /></div>
                        <div><Label>Alternate Phone</Label><Input name="alternate_phone_number" value={step1Data.alternate_phone_number} onChange={handleInput1} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>District *</Label><Input name="district" value={step1Data.district} onChange={handleInput1} required /></div>
                        <div><Label>Mandal *</Label><Input name="mandal" value={step1Data.mandal} onChange={handleInput1} required /></div>
                        <div><Label>Village *</Label><Input name="village" value={step1Data.village} onChange={handleInput1} required /></div>
                        <div><Label>Pincode *</Label><Input name="pincode" value={step1Data.pincode} onChange={handleInput1} required /></div>
                        <div><Label>State *</Label><Input name="state" value={step1Data.state} onChange={handleInput1} required /></div>
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
                        <div><Label>PAN Card URL</Label><Input name="pancard_url" value={step2Data.pancard_url} onChange={handleInput2} /></div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div><Label>Aadhar Front URL *</Label><Input name="aadhar_front_url" value={step2Data.aadhar_front_url} onChange={handleInput2} required /></div>
                        <div><Label>Aadhar Back URL *</Label><Input name="aadhar_back_url" value={step2Data.aadhar_back_url} onChange={handleInput2} required /></div>
                        <div><Label>Photo URL</Label><Input name="user_photo_url" value={step2Data.user_photo_url} onChange={handleInput2} /></div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <Button disabled={mutationStep2.isPending}>{mutationStep2.isPending ? "Saving..." : "Finish"}</Button>
                    </div>
                </form>
            )}
        </Modal>
    );
}
