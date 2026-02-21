import { useState, useEffect } from "react";
import axios from "axios";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import Select from "../form/Select";
import { geoService, GeographyItem } from "../../services/geoService";
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
    reference_id: string;
}

interface AddOfficerModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: OfficerData | null;
}

const SectionTitle = ({ title }: { title: string }) => (
    <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 border-b border-gray-100 dark:border-gray-800 pb-2 mb-4 mt-6 first:mt-0">
        {title}
    </h4>
);

export default function AddOfficerModal({ isOpen, onClose, user }: AddOfficerModalProps) {
    const { showSnackbar } = useSnackbar();
    const queryClient = useQueryClient();

    const getAdminId = () => {
        if (typeof window === 'undefined') return "";
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const userData = JSON.parse(userStr);
                return userData.unique_id || userData.userId || "";
            } catch (e) {
                return "";
            }
        }
        return "";
    };

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
        reference_id: getAdminId(),
    });

    const [aadharFile, setAadharFile] = useState<File | null>(null);
    const [panFile, setPanFile] = useState<File | null>(null);
    const [aadharPreview, setAadharPreview] = useState<string | null>(null);
    const [panPreview, setPanPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Geography state
    const [states, setStates] = useState<GeographyItem[]>([]);
    const [districts, setDistricts] = useState<GeographyItem[]>([]);
    const [mandals, setMandals] = useState<GeographyItem[]>([]);
    const [villages, setVillages] = useState<GeographyItem[]>([]);

    const [selectedStateId, setSelectedStateId] = useState<string>("");
    const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");
    const [selectedMandalId, setSelectedMandalId] = useState<string>("");

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
                reference_id: user.reference_id || "",
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
                reference_id: getAdminId(),
            });
            setAadharFile(null);
            setPanFile(null);
            setAadharPreview(null);
            setPanPreview(null);
            setSelectedStateId("");
            setSelectedDistrictId("");
            setSelectedMandalId("");
        }
    }, [user, isOpen]);

    // Geography Fetching Logic
    useEffect(() => {
        if (isOpen) {
            geoService.getStates()
                .then(res => {
                    let data = [];
                    if (Array.isArray(res)) data = res;
                    else if (res && Array.isArray(res.data)) data = res.data;
                    else if (res && Array.isArray(res.states)) data = res.states;
                    else if (res && typeof res === 'object') {
                        const arrayKey = Object.keys(res).find(key => Array.isArray(res[key]));
                        if (arrayKey) data = res[arrayKey];
                    }

                    setStates(data);
                    if (user?.state && data.length > 0) {
                        const matched = data.find((s: GeographyItem) => (s?.name || "").toLowerCase() === user.state.toLowerCase());
                        if (matched) setSelectedStateId(matched.id.toString());
                    }
                })
                .catch(err => {
                    console.error("States fetch failed", err);
                    setStates([]);
                });
        }
    }, [isOpen, user?.state]);

    useEffect(() => {
        if (isOpen && !user && !formData.reference_id) {
            const adminId = getAdminId();
            if (adminId) {
                setFormData(prev => ({ ...prev, reference_id: adminId }));
            }
        }
    }, [isOpen, user, formData.reference_id]);

    useEffect(() => {
        if (selectedStateId) {
            geoService.getDistricts(selectedStateId)
                .then(res => {
                    let data = [];
                    if (Array.isArray(res)) data = res;
                    else if (res && Array.isArray(res.data)) data = res.data;
                    else if (res && Array.isArray(res.districts)) data = res.districts;
                    else if (res && typeof res === 'object') {
                        const arrayKey = Object.keys(res).find(key => Array.isArray(res[key]));
                        if (arrayKey) data = res[arrayKey];
                    }

                    setDistricts(data);
                    if (user?.district && data.length > 0) {
                        const matched = data.find((d: GeographyItem) => (d?.name || "").toLowerCase() === user.district.toLowerCase());
                        if (matched) setSelectedDistrictId(matched.id.toString());
                    }
                })
                .catch(err => {
                    console.error("Districts fetch failed", err);
                    setDistricts([]);
                });
        } else {
            setDistricts([]);
            setSelectedDistrictId("");
        }
    }, [selectedStateId, user?.district]);

    useEffect(() => {
        if (selectedDistrictId) {
            geoService.getMandals(selectedDistrictId)
                .then(res => {
                    let data = [];
                    if (Array.isArray(res)) data = res;
                    else if (res && Array.isArray(res.data)) data = res.data;
                    else if (res && Array.isArray(res.mandals)) data = res.mandals;
                    else if (res && typeof res === 'object') {
                        const arrayKey = Object.keys(res).find(key => Array.isArray(res[key]));
                        if (arrayKey) data = res[arrayKey];
                    }

                    setMandals(data);
                    if (user?.mandal && data.length > 0) {
                        const matched = data.find((m: GeographyItem) => (m?.name || "").toLowerCase() === user.mandal.toLowerCase());
                        if (matched) setSelectedMandalId(matched.id.toString());
                    }
                })
                .catch(err => {
                    console.error("Mandals fetch failed", err);
                    setMandals([]);
                });
        } else {
            setMandals([]);
            setSelectedMandalId("");
        }
    }, [selectedDistrictId, user?.mandal]);

    useEffect(() => {
        if (selectedMandalId) {
            geoService.getVillages(selectedMandalId)
                .then(res => {
                    let data = [];
                    if (Array.isArray(res)) data = res;
                    else if (res && Array.isArray(res.data)) data = res.data;
                    else if (res && Array.isArray(res.villages)) data = res.villages;
                    else if (res && typeof res === 'object') {
                        const arrayKey = Object.keys(res).find(key => Array.isArray(res[key]));
                        if (arrayKey) data = res[arrayKey];
                    }
                    setVillages(data);
                })
                .catch(err => {
                    console.error("Villages fetch failed", err);
                    setVillages([]);
                });
        } else {
            setVillages([]);
        }
    }, [selectedMandalId]);

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

        if (!formData.first_name.trim()) newErrors.first_name = "Required";
        if (!formData.last_name.trim()) newErrors.last_name = "Required";

        if (!formData.phone_number.trim()) {
            newErrors.phone_number = "Required";
        } else if (!/^\d{10}$/.test(formData.phone_number)) {
            newErrors.phone_number = "Must be 10 digits";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!formData.date_of_birth) newErrors.date_of_birth = "Required";
        if (!formData.gender) newErrors.gender = "Required";

        if (!formData.pincode.trim()) {
            newErrors.pincode = "Required";
        } else if (!/^\d{6}$/.test(formData.pincode)) {
            newErrors.pincode = "Must be 6 digits";
        }

        if (!formData.state.trim()) newErrors.state = "Required";
        if (!formData.district.trim()) newErrors.district = "Required";
        if (!formData.mandal.trim()) newErrors.mandal = "Required";
        if (!formData.village.trim()) newErrors.village = "Required";
        if (!formData.reference_id.trim()) newErrors.reference_id = "Required";

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

        if (name === "phone_number" || name === "pincode") {
            const numericValue = value.replace(/\D/g, "").slice(0, name === "phone_number" ? 10 : 6);
            setFormData(prev => ({ ...prev, [name]: numericValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl p-6 md:p-8 font-outfit rounded-2xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {user ? "Update Field Officer" : "Add Field Officer"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                        Please fill in the details below to {user ? "update the" : "register a new"} officer.
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-gray-800"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar space-y-6">
                    {/* Section 1: Personal Details */}
                    <div>
                        <SectionTitle title="Personal Information" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <Label>First Name <span className="text-error-500">*</span></Label>
                                <Input
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="Enter first name"
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
                                    placeholder="Enter last name"
                                    error={!!errors.last_name}
                                    hint={errors.last_name}
                                />
                            </div>
                            <div>
                                <Label>Phone Number <span className="text-error-500">*</span></Label>
                                <Input
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    placeholder="10-digit number"
                                    error={!!errors.phone_number}
                                    hint={errors.phone_number}
                                />
                            </div>
                            <div>
                                <Label>Email Address <span className="text-error-500">*</span></Label>
                                <Input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email address"
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
                            <div>
                                <Label>Gender <span className="text-error-500">*</span></Label>
                                <div className="mt-1">
                                    <Select
                                        options={[
                                            { value: "MALE", label: "Male" },
                                            { value: "FEMALE", label: "Female" },
                                            { value: "OTHER", label: "Other" },
                                        ]}
                                        placeholder="Select Gender"
                                        value={formData.gender}
                                        onChange={(value) => {
                                            setFormData(prev => ({ ...prev, gender: value }));
                                            if (errors.gender) setErrors(prev => ({ ...prev, gender: "" }));
                                        }}
                                        className={errors.gender ? "border-error-500" : ""}
                                    />
                                    {errors.gender && <p className="mt-1 text-xs text-error-500">{errors.gender}</p>}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <Label>Admin ID (Assigned To) <span className="text-error-500">*</span></Label>
                                <Input
                                    name="reference_id"
                                    value={formData.reference_id}
                                    onChange={() => { }}
                                    placeholder="Admin Identifier"
                                    disabled={true}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Location Details */}
                    <div>
                        <SectionTitle title="Location Details" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <Label>State <span className="text-error-500">*</span></Label>
                                <div className="mt-1">
                                    <Select
                                        options={(states || []).map(s => ({ value: s?.id?.toString() || "", label: s?.name || "" }))}
                                        placeholder="Select State"
                                        value={selectedStateId}
                                        onChange={(val) => {
                                            const state = (states || []).find(s => s?.id?.toString() === val);
                                            setSelectedStateId(val);
                                            setFormData(prev => ({ ...prev, state: state?.name || "", district: "", mandal: "", village: "" }));
                                            setSelectedDistrictId("");
                                            setSelectedMandalId("");
                                            if (errors.state) setErrors(prev => ({ ...prev, state: "" }));
                                        }}
                                        className={errors.state ? "border-error-500" : ""}
                                    />
                                    {errors.state && <p className="mt-1 text-xs text-error-500">{errors.state}</p>}
                                </div>
                            </div>
                            <div>
                                <Label>District <span className="text-error-500">*</span></Label>
                                <div className="mt-1">
                                    <Select
                                        options={(districts || []).map(d => ({ value: d?.id?.toString() || "", label: d?.name || "" }))}
                                        placeholder="Select District"
                                        value={selectedDistrictId || ""}
                                        onChange={(val) => {
                                            const dist = (districts || []).find(d => d?.id?.toString() === val);
                                            setSelectedDistrictId(val);
                                            setFormData(prev => ({ ...prev, district: dist?.name || "", mandal: "", village: "" }));
                                            setSelectedMandalId("");
                                            if (errors.district) setErrors(prev => ({ ...prev, district: "" }));
                                        }}
                                        disabled={!selectedStateId}
                                        className={errors.district ? "border-error-500" : ""}
                                    />
                                    {errors.district && <p className="mt-1 text-xs text-error-500">{errors.district}</p>}
                                </div>
                            </div>
                            <div>
                                <Label>Mandal <span className="text-error-500">*</span></Label>
                                <div className="mt-1">
                                    <Select
                                        options={(mandals || []).map(m => ({ value: m?.id?.toString() || "", label: m?.name || "" }))}
                                        placeholder="Select Mandal"
                                        value={selectedMandalId || ""}
                                        onChange={(val) => {
                                            const mandal = (mandals || []).find(m => m?.id?.toString() === val);
                                            setSelectedMandalId(val);
                                            setFormData(prev => ({ ...prev, mandal: mandal?.name || "", village: "" }));
                                            if (errors.mandal) setErrors(prev => ({ ...prev, mandal: "" }));
                                        }}
                                        disabled={!selectedDistrictId}
                                        className={errors.mandal ? "border-error-500" : ""}
                                    />
                                    {errors.mandal && <p className="mt-1 text-xs text-error-500">{errors.mandal}</p>}
                                </div>
                            </div>
                            <div>
                                <Label>Village <span className="text-error-500">*</span></Label>
                                <div className="mt-1">
                                    <Select
                                        options={(villages || []).map(v => ({ value: v?.name || "", label: v?.name || "" }))}
                                        placeholder="Select Village"
                                        value={formData.village || ""}
                                        onChange={(val) => {
                                            setFormData(prev => ({ ...prev, village: val }));
                                            if (errors.village) setErrors(prev => ({ ...prev, village: "" }));
                                        }}
                                        disabled={!selectedMandalId}
                                        className={errors.village ? "border-error-500" : ""}
                                    />
                                    {errors.village && <p className="mt-1 text-xs text-error-500">{errors.village}</p>}
                                </div>
                            </div>
                            <div>
                                <Label>Pincode <span className="text-error-500">*</span></Label>
                                <Input
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    placeholder="6-digit PIN"
                                    error={!!errors.pincode}
                                    hint={errors.pincode}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Identity Documents */}
                    <div>
                        <SectionTitle title="Documents (Optional)" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Aadhaar Card Upload */}
                            <div>
                                <Label>Aadhaar Card</Label>
                                <div className="mt-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/30">
                                    {(aadharPreview || formData.aadhar_image_url) ? (
                                        <div className="relative group rounded-lg overflow-hidden h-32 bg-gray-100 dark:bg-gray-800 border-2 border-transparent hover:border-brand-500 transition-colors">
                                            <img src={aadharPreview || formData.aadhar_image_url} alt="Aadhaar" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); setAadharFile(null); setAadharPreview(null); setFormData(prev => ({ ...prev, aadhar_image_url: "" })); }}
                                                    className="bg-red-500 text-white p-2 rounded-lg text-xs font-semibold hover:bg-red-600 shadow-lg flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-32 flex flex-col items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                            <span className="text-gray-500 text-sm font-medium">Click to upload image</span>
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={(e) => setAadharFile(e.target.files?.[0] || null)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* PAN Card Upload */}
                            <div>
                                <Label>PAN Card</Label>
                                <div className="mt-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/30">
                                    {(panPreview || formData.pan_image_url) ? (
                                        <div className="relative group rounded-lg overflow-hidden h-32 bg-gray-100 dark:bg-gray-800 border-2 border-transparent hover:border-brand-500 transition-colors">
                                            <img src={panPreview || formData.pan_image_url} alt="PAN" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); setPanFile(null); setPanPreview(null); setFormData(prev => ({ ...prev, pan_image_url: "" })); }}
                                                    className="bg-red-500 text-white p-2 rounded-lg text-xs font-semibold hover:bg-red-600 shadow-lg flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-32 flex flex-col items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                            <span className="text-gray-500 text-sm font-medium">Click to upload image</span>
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={(e) => setPanFile(e.target.files?.[0] || null)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button variant="outline" onClick={onClose} type="button">
                        Cancel
                    </Button>
                    <Button disabled={mutation.isPending || uploading}>
                        {mutation.isPending || uploading ? "Processing..." : (user ? "Update Officer" : "Add Officer")}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
