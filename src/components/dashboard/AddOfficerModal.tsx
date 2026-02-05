import { useState } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { createAO } from "../../services/userService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../context/SnackbarContext";

interface AddOfficerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddOfficerModal({ isOpen, onClose }: AddOfficerModalProps) {
    const { showSnackbar } = useSnackbar();
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

    const [errors, setErrors] = useState<Record<string, string>>({});

    const queryClient = useQueryClient();

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
        if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";

        if (!formData.phone_number.trim()) {
            newErrors.phone_number = "Phone number is required";
        } else if (!/^\d{10}$/.test(formData.phone_number)) {
            newErrors.phone_number = "Phone number must be 10 digits";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required";

        if (!formData.pincode.trim()) {
            newErrors.pincode = "Pincode is required";
        } else if (!/^\d{6}$/.test(formData.pincode)) {
            newErrors.pincode = "Pincode must be 6 digits";
        }

        if (!formData.state.trim()) newErrors.state = "State is required";
        if (!formData.district.trim()) newErrors.district = "District is required";
        if (!formData.mandal.trim()) newErrors.mandal = "Mandal is required";
        if (!formData.village.trim()) newErrors.village = "Village is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const mutation = useMutation({
        mutationFn: createAO,
        onSuccess: () => {
            showSnackbar("Officer added successfully!", "success");
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
            setErrors({});
        },
        onError: (error: any) => {
            console.error("Failed to create AO", error);
            showSnackbar(error.response?.data?.detail || "Failed to create Officer", "error");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            mutation.mutate(formData);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Only allow numbers for phone_number and pincode
        if (name === "phone_number" || name === "pincode") {
            const numericValue = value.replace(/\D/g, "").slice(0, name === "phone_number" ? 10 : 6);
            setFormData({ ...formData, [name]: numericValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6">
            <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">
                Add Agricultural Officer
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="max-h-[60vh] overflow-y-auto px-1 -mx-1 custom-scrollbar">
                    <div className="space-y-4 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>First Name <span className="text-error-500">*</span></Label>
                                <Input
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    error={!!errors.first_name}
                                    hint={errors.first_name}
                                />
                            </div>
                            <div>
                                <Label>Last Name <span className="text-error-500">*</span></Label>
                                <Input
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    error={!!errors.last_name}
                                    hint={errors.last_name}
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Phone Number <span className="text-error-500">*</span></Label>
                            <Input
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                error={!!errors.phone_number}
                                hint={errors.phone_number}
                            />
                        </div>
                        <div>
                            <Label>Email <span className="text-error-500">*</span></Label>
                            <Input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                hint={errors.email}
                            />
                        </div>

                        <div>
                            <Label>Date of Birth <span className="text-error-500">*</span></Label>
                            <Input
                                name="date_of_birth"
                                type="date"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                onClick={(e) => e.currentTarget.showPicker?.()}
                                error={!!errors.date_of_birth}
                                hint={errors.date_of_birth}
                            />
                        </div>

                        <h4 className="font-medium text-gray-700 dark:text-gray-300 border-b pb-2 mt-4">Location</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Pincode <span className="text-error-500">*</span></Label>
                                <Input
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    error={!!errors.pincode}
                                    hint={errors.pincode}
                                />
                            </div>
                            <div>
                                <Label>State <span className="text-error-500">*</span></Label>
                                <Input
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    error={!!errors.state}
                                    hint={errors.state}
                                />
                            </div>
                            <div>
                                <Label>District <span className="text-error-500">*</span></Label>
                                <Input
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    error={!!errors.district}
                                    hint={errors.district}
                                />
                            </div>
                            <div>
                                <Label>Mandal <span className="text-error-500">*</span></Label>
                                <Input
                                    name="mandal"
                                    value={formData.mandal}
                                    onChange={handleChange}
                                    error={!!errors.mandal}
                                    hint={errors.mandal}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <Label>Village <span className="text-error-500">*</span></Label>
                                <Input
                                    name="village"
                                    value={formData.village}
                                    onChange={handleChange}
                                    error={!!errors.village}
                                    hint={errors.village}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button variant="outline" onClick={onClose} type="button" className="flex-1 sm:flex-none">Cancel</Button>
                    <Button disabled={mutation.isPending} className="flex-1 sm:flex-none">
                        {mutation.isPending ? "Adding..." : "Add Officer"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
