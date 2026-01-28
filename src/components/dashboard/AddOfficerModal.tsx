import { useState } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { createAO } from "../../services/userService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AddOfficerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddOfficerModal({ isOpen, onClose }: AddOfficerModalProps) {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        phone_number: "",
        email: "",
        pincode: "",
        village: "",
        mandal: "",
        district: "",
        state: "",
        date_of_birth: "",
    });

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: createAO,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["aos"] });
            onClose();
            setFormData({
                first_name: "",
                last_name: "",
                phone_number: "",
                email: "",
                pincode: "",
                village: "",
                mandal: "",
                district: "",
                state: "",
                date_of_birth: "",
            });
        },
        onError: (error) => {
            console.error("Failed to create AO", error);
            alert("Failed to create Officer");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6">
            <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">
                Add Agricultural Officer
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>First Name <span className="text-error-500">*</span></Label>
                        <Input name="first_name" value={formData.first_name} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label>Last Name <span className="text-error-500">*</span></Label>
                        <Input name="last_name" value={formData.last_name} onChange={handleChange} required />
                    </div>
                </div>
                <div>
                    <Label>Phone Number <span className="text-error-500">*</span></Label>
                    <Input name="phone_number" value={formData.phone_number} onChange={handleChange} required />
                </div>
                <div>
                    <Label>Email <span className="text-error-500">*</span></Label>
                    <Input name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div>
                    <Label>Date of Birth <span className="text-error-500">*</span></Label>
                    <Input name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} required />
                </div>

                <h4 className="font-medium text-gray-700 dark:text-gray-300 border-b pb-2 mt-4">Location</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Pincode <span className="text-error-500">*</span></Label>
                        <Input name="pincode" value={formData.pincode} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label>State <span className="text-error-500">*</span></Label>
                        <Input name="state" value={formData.state} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label>District <span className="text-error-500">*</span></Label>
                        <Input name="district" value={formData.district} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label>Mandal <span className="text-error-500">*</span></Label>
                        <Input name="mandal" value={formData.mandal} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label>Village <span className="text-error-500">*</span></Label>
                        <Input name="village" value={formData.village} onChange={handleChange} required />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
                    <Button disabled={mutation.isPending}>
                        {mutation.isPending ? "Adding..." : "Add Officer"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
