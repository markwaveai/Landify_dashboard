import { useRef, useState, useEffect } from "react";
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
    mandal_id?: string;
    district: string;
    state: string;
    date_of_birth: string;
    gender: string;
    aadhar_image_url: string;
    pan_image_url: string;
    aadhar_card_number?: string;
    pan_card_number?: string;
    bank_account_name?: string;
    bank_account_number?: string;
    bank_name?: string;
    bank_ifsc_code?: string;
    bank_branch_name?: string;
    bank_passbook_image_url?: string;
    reference_id: string;
    is_active?: boolean;
    status?: string;
    user_image_url?: string;
    alternate_phone_number?: string;
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

    // Refs for sections
    const profileRef = useRef<HTMLDivElement>(null);
    const personalRef = useRef<HTMLDivElement>(null);
    const locationRef = useRef<HTMLDivElement>(null);
    const documentsRef = useRef<HTMLDivElement>(null);
    const bankRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [activeSection, setActiveSection] = useState("profile");

    const sections = [
        { id: "profile", label: "Profile", ref: profileRef },
        { id: "personal", label: "Personal", ref: personalRef },
        { id: "location", label: "Location", ref: locationRef },
        { id: "documents", label: "Documents", ref: documentsRef },
        { id: "bank", label: "Bank", ref: bankRef },
    ];

    const scrollToSection = (sectionRef: React.RefObject<HTMLDivElement | null>, id: string) => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveSection(id);
    };

    // Track scroll to update active section
    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const scrollPos = container.scrollTop + 100;

        for (const section of sections) {
            if (section.ref.current) {
                const offset = section.ref.current.offsetTop - container.offsetTop;
                if (scrollPos >= offset) {
                    setActiveSection(section.id);
                }
            }
        }
    };

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        phone_number: "",
        email: "",
        pincode: "",
        village: "",
        mandal: "",
        mandal_id: "",
        district: "",
        state: "",
        date_of_birth: "",
        gender: "",
        aadhar_image_url: "",
        pan_image_url: "",
        aadhar_card_number: "",
        pan_card_number: "",
        bank_account_name: "",
        bank_account_number: "",
        bank_name: "",
        bank_ifsc_code: "",
        bank_branch_name: "",
        bank_passbook_image_url: "",
        reference_id: getAdminId(),
        is_active: true,
        status: "ACTIVE",
        user_image_url: "",
        alternate_phone_number: "",
    });

    const [aadharFile, setAadharFile] = useState<File | null>(null);
    const [panFile, setPanFile] = useState<File | null>(null);
    const [aadharPreview, setAadharPreview] = useState<string | null>(null);
    const [panPreview, setPanPreview] = useState<string | null>(null);
    const [passbookFile, setPassbookFile] = useState<File | null>(null);
    const [passbookPreview, setPassbookPreview] = useState<string | null>(null);
    const [userImageFile, setUserImageFile] = useState<File | null>(null);
    const [userImagePreview, setUserImagePreview] = useState<string | null>(null);
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
                mandal_id: (user as any).mandal_id || "",
                district: user.district || "",
                state: user.state || "",
                date_of_birth: user.date_of_birth || "",
                gender: user.gender || "",
                aadhar_image_url: user.aadhar_image_url || "",
                pan_image_url: user.pan_image_url || "",
                aadhar_card_number: user.aadhar_card_number || "",
                pan_card_number: user.pan_card_number || "",
                bank_account_name: user.bank_account_name || "",
                bank_account_number: user.bank_account_number || "",
                bank_name: user.bank_name || "",
                bank_ifsc_code: user.bank_ifsc_code || "",
                bank_branch_name: user.bank_branch_name || "",
                bank_passbook_image_url: user.bank_passbook_image_url || "",
                reference_id: user.reference_id || "",
                is_active: user.is_active ?? true,
                status: user.status || "ACTIVE",
                user_image_url: user.user_image_url || "",
                alternate_phone_number: user.alternate_phone_number || "",
            });
            setAadharFile(null);
            setPanFile(null);
            setAadharPreview(user.aadhar_image_url || null);
            setPanPreview(user.pan_image_url || null);
            setPassbookPreview(user.bank_passbook_image_url || null);
            setUserImagePreview(user.user_image_url || null);
        } else if (!user && isOpen) {
            setFormData({
                first_name: "",
                last_name: "",
                phone_number: "",
                email: "",
                pincode: "",
                village: "",
                mandal: "",
                mandal_id: "",
                district: "",
                state: "",
                date_of_birth: "",
                gender: "",
                aadhar_image_url: "",
                pan_image_url: "",
                aadhar_card_number: "",
                pan_card_number: "",
                bank_account_name: "",
                bank_account_number: "",
                bank_name: "",
                bank_ifsc_code: "",
                bank_branch_name: "",
                bank_passbook_image_url: "",
                reference_id: getAdminId(),
                is_active: true,
                status: "ACTIVE",
                user_image_url: "",
                alternate_phone_number: "",
            });
            setAadharFile(null);
            setPanFile(null);
            setPassbookFile(null);
            setUserImageFile(null);
            setAadharPreview(null);
            setPanPreview(null);
            setPassbookPreview(null);
            setUserImagePreview(null);
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

    useEffect(() => {
        if (passbookFile) {
            const objectUrl = URL.createObjectURL(passbookFile);
            setPassbookPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [passbookFile]);

    useEffect(() => {
        if (userImageFile) {
            const objectUrl = URL.createObjectURL(userImageFile);
            setUserImagePreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [userImageFile]);

    // Auto-fetch Bank Name and Branch based on IFSC Code
    useEffect(() => {
        const fetchIfscDetails = async () => {
            if (formData.bank_ifsc_code && formData.bank_ifsc_code.length === 11) {
                try {
                    const response = await axios.get(`https://ifsc.razorpay.com/${formData.bank_ifsc_code}`);
                    setFormData(prev => ({
                        ...prev,
                        bank_name: prev.bank_name || response.data.BANK || "",
                        bank_branch_name: prev.bank_branch_name || response.data.BRANCH || ""
                    }));
                    if (errors.bank_ifsc_code) setErrors(prev => ({ ...prev, bank_ifsc_code: "" }));
                } catch (error) {
                    console.error("Failed to fetch IFSC details:", error);
                    setErrors(prev => ({ ...prev, bank_ifsc_code: "Invalid IFSC Code or not found" }));
                }
            }
        };
        fetchIfscDetails();
    }, [formData.bank_ifsc_code]);

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

        if (formData.alternate_phone_number && formData.alternate_phone_number.trim() && !/^\d{10}$/.test(formData.alternate_phone_number)) {
            newErrors.alternate_phone_number = "Must be 10 digits";
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
        if (!formData.aadhar_card_number.trim()) {
            newErrors.aadhar_card_number = "Required";
        } else if (!/^\d{12}$/.test(formData.aadhar_card_number)) {
            newErrors.aadhar_card_number = "Must be 12 digits";
        }

        if (formData.pan_card_number.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_card_number)) {
            newErrors.pan_card_number = "Invalid PAN format";
        }
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
                let passbookUrl = formData.bank_passbook_image_url;
                let userImageUrl = formData.user_image_url;

                if (aadharFile) {
                    aadharUrl = await uploadFile(aadharFile, 'aadhar', formData.phone_number);
                }
                if (panFile) {
                    panUrl = await uploadFile(panFile, 'pan', formData.phone_number);
                }
                if (passbookFile) {
                    passbookUrl = await uploadFile(passbookFile, 'passbook', formData.phone_number);
                }
                if (userImageFile) {
                    userImageUrl = await uploadFile(userImageFile, 'profile_image', formData.phone_number);
                }

                mutation.mutate({
                    ...formData,
                    aadhar_image_url: aadharUrl,
                    pan_image_url: panUrl,
                    bank_passbook_image_url: passbookUrl,
                    user_image_url: userImageUrl
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

        if (name === "phone_number" || name === "alternate_phone_number" || name === "pincode" || name === "aadhar_card_number" || name === "bank_account_number") {
            const maxLength = (name === "phone_number" || name === "alternate_phone_number") ? 10 : name === "pincode" ? 6 : name === "aadhar_card_number" ? 12 : 20;
            const numericValue = value.replace(/\D/g, "").slice(0, maxLength);
            setFormData(prev => ({ ...prev, [name]: numericValue }));
        } else if (name === "first_name" || name === "last_name" || name === "bank_account_name") {
            // Remove numbers from name fields
            const alphaValue = value.replace(/[0-9]/g, "");
            setFormData(prev => ({ ...prev, [name]: alphaValue }));
        } else if (name === "pan_card_number") {
            setFormData(prev => ({ ...prev, [name]: value.toUpperCase().slice(0, 10) }));
        } else if (name === "bank_ifsc_code") {
            setFormData(prev => ({ ...prev, [name]: value.toUpperCase().slice(0, 11) }));
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

            <form onSubmit={handleSubmit} className="relative">
                <style>
                    {`
                        .prominent-scrollbar::-webkit-scrollbar {
                            width: 8px;
                            display: block !important;
                        }
                        .prominent-scrollbar::-webkit-scrollbar-track {
                            background: rgba(0,0,0,0.03);
                            border-radius: 10px;
                        }
                        .prominent-scrollbar::-webkit-scrollbar-thumb {
                            background: #d1d5db;
                            border-radius: 10px;
                            border: 2px solid transparent;
                            background-clip: content-box;
                        }
                        .dark .prominent-scrollbar::-webkit-scrollbar-thumb {
                            background: #4b5563;
                        }
                        .prominent-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: #9ca3af;
                        }
                        .no-scrollbar::-webkit-scrollbar {
                            display: none !important;
                        }
                    `}
                </style>
                <div className="flex gap-8">
                    {/* Side Navigation Bar */}
                    <div className="hidden md:flex flex-col gap-1 w-32 shrink-0 sticky top-0 h-fit pt-4">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                type="button"
                                onClick={() => scrollToSection(section.ref, section.id)}
                                className={`text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeSection === section.id
                                    ? "bg-brand-500 text-white shadow-sm translate-x-1"
                                    : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                            >
                                {section.label}
                            </button>
                        ))}
                    </div>

                    {/* Scrollable Form Content */}
                    <div
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 max-h-[60vh] overflow-y-scroll pr-4 prominent-scrollbar space-y-10 pb-10"
                    >
                        {/* Profile Image Section */}
                        <div ref={profileRef} className="scroll-mt-4">
                            <div className="flex flex-col items-center justify-center py-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                <div className="relative group">
                                    <div className="size-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                        {userImagePreview ? (
                                            <img src={userImagePreview} alt="Profile" className="size-full object-cover" />
                                        ) : (
                                            <svg className="size-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                        )}
                                    </div>
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                                        <span className="text-[10px] font-bold uppercase text-center px-2 leading-tight">Change Image</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setUserImageFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Profile Picture</p>
                            </div>
                        </div>

                        {/* Section 1: Personal Details */}
                        <div ref={personalRef} className="scroll-mt-4">
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
                                    <Label>Alternate Phone Number <span className="text-gray-400 text-[10px] font-normal ml-1">(Optional)</span></Label>
                                    <Input
                                        name="alternate_phone_number"
                                        value={formData.alternate_phone_number}
                                        onChange={handleChange}
                                        placeholder="Optional number"
                                        error={!!errors.alternate_phone_number}
                                        hint={errors.alternate_phone_number}
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
                                <div>
                                    <Label>Status <span className="text-error-500">*</span></Label>
                                    <div className="mt-1">
                                        <Select
                                            options={[
                                                { value: "ACTIVE", label: "Active" },
                                                { value: "INACTIVE", label: "Inactive" },
                                            ]}
                                            placeholder="Select Status"
                                            value={formData.status}
                                            onChange={(value) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    status: value,
                                                    is_active: value === "ACTIVE"
                                                }));
                                            }}
                                        />
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
                        <div ref={locationRef} className="scroll-mt-4">
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
                                                setFormData(prev => ({ ...prev, mandal: mandal?.name || "", mandal_id: val, village: "" }));
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
                        <div ref={documentsRef} className="scroll-mt-4">
                            <SectionTitle title="Documents" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Aadhaar Card Upload */}
                                <div>
                                    <Label>Aadhaar Number <span className="text-error-500">*</span></Label>
                                    <Input
                                        name="aadhar_card_number"
                                        value={formData.aadhar_card_number}
                                        onChange={handleChange}
                                        placeholder="12-digit Aadhaar Number"
                                        error={!!errors.aadhar_card_number}
                                        hint={errors.aadhar_card_number}
                                    />
                                    <div className="mt-4"></div>
                                    <Label>Aadhaar Card Document</Label>
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
                                    <Label>PAN Number</Label>
                                    <Input
                                        name="pan_card_number"
                                        value={formData.pan_card_number}
                                        onChange={handleChange}
                                        placeholder="10-character PAN Number"
                                        error={!!errors.pan_card_number}
                                        hint={errors.pan_card_number}
                                    />
                                    <div className="mt-4"></div>
                                    <Label>PAN Card Document</Label>
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

                        {/* Section 4: Bank Details */}
                        <div ref={bankRef} className="scroll-mt-4">
                            <SectionTitle title="Bank Details" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <Label>Account Holder Name</Label>
                                    <Input
                                        name="bank_account_name"
                                        value={formData.bank_account_name}
                                        onChange={handleChange}
                                        placeholder="Enter account holder name"
                                        error={!!errors.bank_account_name}
                                        hint={errors.bank_account_name}
                                    />
                                </div>
                                <div>
                                    <Label>Bank Name</Label>
                                    <Input
                                        name="bank_name"
                                        value={formData.bank_name}
                                        onChange={handleChange}
                                        placeholder="Enter bank name"
                                        error={!!errors.bank_name}
                                        hint={errors.bank_name}
                                    />
                                </div>
                                <div>
                                    <Label>Account Number</Label>
                                    <Input
                                        name="bank_account_number"
                                        value={formData.bank_account_number}
                                        onChange={handleChange}
                                        placeholder="Enter account number"
                                        error={!!errors.bank_account_number}
                                        hint={errors.bank_account_number}
                                    />
                                </div>
                                <div>
                                    <Label>IFSC Code</Label>
                                    <Input
                                        name="bank_ifsc_code"
                                        value={formData.bank_ifsc_code}
                                        onChange={handleChange}
                                        placeholder="Enter 11-character IFSC code"
                                        error={!!errors.bank_ifsc_code}
                                        hint={errors.bank_ifsc_code}
                                    />
                                </div>
                                <div>
                                    <Label>Branch Name</Label>
                                    <Input
                                        name="bank_branch_name"
                                        value={formData.bank_branch_name}
                                        onChange={handleChange}
                                        placeholder="Enter branch name"
                                        error={!!errors.bank_branch_name}
                                        hint={errors.bank_branch_name}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label>Passbook Document</Label>
                                    <div className="mt-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/30">
                                        {(passbookPreview || formData.bank_passbook_image_url) ? (
                                            <div className="relative group rounded-lg overflow-hidden h-32 bg-gray-100 dark:bg-gray-800 border-2 border-transparent hover:border-brand-500 transition-colors">
                                                <img src={passbookPreview || formData.bank_passbook_image_url} alt="Passbook" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.preventDefault(); setPassbookFile(null); setPassbookPreview(null); setFormData(prev => ({ ...prev, bank_passbook_image_url: "" })); }}
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
                                                    onChange={(e) => setPassbookFile(e.target.files?.[0] || null)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                            </div>
                                        )}
                                    </div>
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
