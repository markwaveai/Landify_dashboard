import { useState, useEffect } from "react";
import axios from "axios";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import Select from "../form/Select";
import { createAO, updateAO } from "../../services/userService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../context/SnackbarContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";

interface OfficerData {
    unique_id?: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    pincode: string;
    village: string;
    mandal: string;
    district: string;
    state: string;
    date_of_birth: string;
    gender: string;
    aadhar_image_url: string;
    pan_image_url: string;
}

interface AddOfficerModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: OfficerData | null;
}

export default function AddOfficerModal({ isOpen, onClose, user }: AddOfficerModalProps) {
    const { showSnackbar } = useSnackbar();
    const queryClient = useQueryClient();

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
        gender: "",
        aadhar_image_url: "",
        pan_image_url: "",
    });

    const [aadharFile, setAadharFile] = useState<File | null>(null);
    const [panFile, setPanFile] = useState<File | null>(null);
    const [aadharPreview, setAadharPreview] = useState<string | null>(null);
    const [panPreview, setPanPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Populate form data when editing
    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                phone_number: user.phone_number || "",
                email: user.email || "",
                pincode: user.pincode || "",
                village: user.village || "",
                mandal: user.mandal || "",
                district: user.district || "",
                state: user.state || "",
                date_of_birth: user.date_of_birth || "",
                gender: user.gender || "",
                aadhar_image_url: user.aadhar_image_url || "",
                pan_image_url: user.pan_image_url || "",
            });
            setAadharFile(null);
            setPanFile(null);
            setAadharPreview(user.aadhar_image_url || null);
            setPanPreview(user.pan_image_url || null);
        } else if (!user && isOpen) {
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
                gender: "",
                aadhar_image_url: "",
                pan_image_url: "",
            });
            setAadharFile(null);
            setPanFile(null);
            setAadharPreview(null);
            setPanPreview(null);
        }
    }, [user, isOpen]);

    // Handle image previews
    useEffect(() => {
        if (aadharFile) {
            const objectUrl = URL.createObjectURL(aadharFile);
            setAadharPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [aadharFile]);

    useEffect(() => {
        if (panFile) {
            const objectUrl = URL.createObjectURL(panFile);
            setPanPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [panFile]);

    const [errors, setErrors] = useState<Record<string, string>>({});

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
        if (!formData.gender) newErrors.gender = "Gender is required";

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
        mutationFn: (data: Partial<OfficerData>) => user?.unique_id ? updateAO(user.unique_id, data) : createAO(data),
        onSuccess: () => {
            showSnackbar(user ? "Officer updated successfully!" : "Officer added successfully!", "success");
            queryClient.invalidateQueries({ queryKey: ["aos"] });
            onClose();
            setErrors({});
        },
        onError: (error: unknown) => {
            console.error("Failed to save AO", error);
            const detail = axios.isAxiosError(error)
                ? (error.response?.data as { detail?: string })?.detail
                : `Failed to ${user ? 'update' : 'create'} Officer`;
            showSnackbar(detail || `Failed to ${user ? 'update' : 'create'} Officer`, "error");
        }
    });

    const uploadFile = async (file: File, folder: string, phoneNumber: string) => {
        const fileRef = ref(storage, `landify/field_officer_documents/${phoneNumber}/${folder}_${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        return await getDownloadURL(snapshot.ref);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            setUploading(true);
            try {
                let aadharUrl = formData.aadhar_image_url;
                let panUrl = formData.pan_image_url;

                if (aadharFile) {
                    aadharUrl = await uploadFile(aadharFile, 'aadhar', formData.phone_number);
                }
                if (panFile) {
                    panUrl = await uploadFile(panFile, 'pan', formData.phone_number);
                }

                mutation.mutate({
                    ...formData,
                    aadhar_image_url: aadharUrl,
                    pan_image_url: panUrl
                });
            } catch (error: unknown) {
                console.error("Upload failed", error);
                showSnackbar("Failed to upload documents", "error");
            } finally {
                setUploading(false);
            }
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
                {user ? "Update Field Officer" : "Add Field Officer"}
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
                                onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
                                error={!!errors.date_of_birth}
                                hint={errors.date_of_birth}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Label>Gender <span className="text-error-500">*</span></Label>
                                <Select
                                    options={[
                                        { value: "MALE", label: "Male" },
                                        { value: "FEMALE", label: "Female" },
                                        { value: "OTHER", label: "Other" },
                                    ]}
                                    placeholder="Select Gender"
                                    value={formData.gender}
                                    onChange={(value) => {
                                        setFormData({ ...formData, gender: value });
                                        if (errors.gender) setErrors({ ...errors, gender: "" });
                                    }}
                                    className={errors.gender ? "border-error-500" : ""}
                                />
                                {errors.gender && <p className="mt-1 text-xs text-error-500">{errors.gender}</p>}
                            </div>
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

                        <h4 className="font-medium text-gray-700 dark:text-gray-300 border-b pb-2 mt-4">Documents</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Upload Aadhaar Card</Label>
                                <div className="mt-2 space-y-3">
                                    {aadharPreview && (
                                        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                            <img src={aadharPreview} alt="Aadhaar Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => { setAadharFile(null); setAadharPreview(formData.aadhar_image_url || null); }}
                                                className="absolute top-1 right-1 bg-white/80 dark:bg-black/50 p-1 rounded-full text-gray-600 dark:text-gray-300 hover:text-error-500"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={(e) => setAadharFile(e.target.files?.[0] || null)}
                                        className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                                    />
                                    {formData.aadhar_image_url && !aadharFile && (
                                        <p className="text-xs text-success-600 font-medium flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                            Original document saved
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <Label>Upload PAN Card</Label>
                                <div className="mt-2 space-y-3">
                                    {panPreview && (
                                        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                            <img src={panPreview} alt="PAN Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => { setPanFile(null); setPanPreview(formData.pan_image_url || null); }}
                                                className="absolute top-1 right-1 bg-white/80 dark:bg-black/50 p-1 rounded-full text-gray-600 dark:text-gray-300 hover:text-error-500"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={(e) => setPanFile(e.target.files?.[0] || null)}
                                        className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                                    />
                                    {formData.pan_image_url && !panFile && (
                                        <p className="text-xs text-success-600 font-medium flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                            Original document saved
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button variant="outline" onClick={onClose} type="button" className="flex-1 sm:flex-none">Cancel</Button>
                    <Button disabled={mutation.isPending || uploading} className="flex-1 sm:flex-none">
                        {mutation.isPending || uploading ? (user ? "Updating..." : "Adding...") : (user ? "Update Officer" : "Add Officer")}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
