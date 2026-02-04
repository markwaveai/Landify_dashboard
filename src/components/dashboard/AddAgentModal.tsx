import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { createAgentStep1, updateAgentStep2 } from "../../services/userService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../context/SnackbarContext";

interface AddAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    agent?: any; // To allow editing/continuing
}

export default function AddAgentModal({ isOpen, onClose, agent }: AddAgentModalProps) {
    const { showSnackbar } = useSnackbar();
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
        state: "",
        pincode: "",
        mandal: "",
        district: "",
        village: "",
    });

    const [step2Data, setStep2Data] = useState({
        aadhar_card_number: "",
        aadhar_front_url: "http://example.com/front",
        aadhar_back_url: "http://example.com/back",
        pancard_url: "http://example.com/pan",
        user_photo_url: "http://example.com/photo",
    });

    useEffect(() => {
        if (isOpen && agent) {
            setUniqueId(agent.unique_id);

            // Pre-fill Step 1
            setStep1Data(prev => ({
                ...prev,
                first_name: agent.first_name || "",
                last_name: agent.last_name || "",
                surname: agent.surname || "",
                phone_number: agent.phone_number || "",
                email: agent.email || "",
                gender: agent.gender || "Male",
                date_of_birth: agent.date_of_birth || "",
                state: agent.state || "",
                pincode: agent.pincode || "",
                mandal: agent.mandal || "",
                district: agent.district || "",
                village: agent.village || "",
            }));

            // Pre-fill Step 2
            setStep2Data(prev => ({
                ...prev,
                aadhar_card_number: agent.aadhar_card_number || "",
                aadhar_front_url: agent.aadhar_front_url || "http://example.com/front",
                aadhar_back_url: agent.aadhar_back_url || "http://example.com/back",
                pancard_url: agent.pancard_url || "http://example.com/pan",
                user_photo_url: agent.user_photo_url || "http://example.com/photo",
            }));

            // Determine Step
            // If Step 1 is done AND Step 2 is NOT done -> Go to Step 2
            // If both done -> User might want to edit. We start at Step 1 to allow full review? 
            // Or if we strictly follow "continue where left off":
            if (agent.is_step1_completed && !agent.is_step2_completed) {
                setStep(2);
            } else {
                // If neither done (fresh?) or both done (edit), start at 1
                setStep(1);
            }
        } else if (isOpen && !agent) {
            // Reset for new entry
            setStep(1);
            setUniqueId(null);
            setStep1Data({
                first_name: "",
                last_name: "",
                surname: "",
                phone_number: "",
                email: "",
                gender: "Male",
                date_of_birth: "",
                state: "",
                pincode: "",
                mandal: "",
                district: "",
                village: "",
            });
            setStep2Data({
                aadhar_card_number: "",
                aadhar_front_url: "http://example.com/front",
                aadhar_back_url: "http://example.com/back",
                pancard_url: "http://example.com/pan",
                user_photo_url: "http://example.com/photo",
            });
        }
    }, [isOpen, agent]);

    const queryClient = useQueryClient();

    const mutationStep1 = useMutation({
        mutationFn: createAgentStep1,
        onSuccess: (data: any) => {
            setUniqueId(data.unique_id);
            setStep(2);
        },
        onError: (error: any) => {
            console.error("Failed Step 1", error);
            showSnackbar(error.response?.data?.detail || "Failed to create Agent (Step 1)", "error");
        }
    });

    const mutationStep2 = useMutation({
        mutationFn: (data: any) => updateAgentStep2(uniqueId!, data),
        onSuccess: () => {
            showSnackbar("Agent added successfully!", "success");
            queryClient.invalidateQueries({ queryKey: ["agents"] });
            onClose();
            // Reset
            setStep(1);
            setUniqueId(null);
        },
        onError: (error: any) => {
            console.error("Failed Step 2", error);
            showSnackbar(error.response?.data?.detail || "Failed to update Agent (Step 2)", "error");
        }
    });

    const handleStep1Submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        if (!step1Data.first_name || !step1Data.phone_number || !step1Data.email || !step1Data.district) {
            showSnackbar("Please fill all required fields", "warning");
            return;
        }

        if (step1Data.phone_number.length !== 10) {
            showSnackbar("Phone number must be 10 digits", "warning");
            return;
        }

        mutationStep1.mutate({ ...step1Data, is_step1_completed: true });
    };

    const handleStep2Submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!step2Data.aadhar_card_number) {
            showSnackbar("Aadhar Card Number is required", "warning");
            return;
        }

        mutationStep2.mutate({ ...step2Data, is_step2_completed: true });
    };

    const handleInput1 = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
