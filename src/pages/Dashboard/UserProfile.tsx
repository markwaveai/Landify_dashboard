import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import {
    UserCircleIcon, GroupIcon, UserIcon, PencilIcon, LogoutIcon
} from "../../icons";
import { logout } from "../../store/slices/authSlice";
import { fetchProfile, updateProfile } from "../../services/authService";
import { setCredentials } from "../../store/slices/authSlice";
import Button from "../../components/ui/button/Button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Reusable Input Component for the cleaner look
const InputField = ({ label, value, onChange, type = "text", disabled = false, icon, placeholder }: any) => (
    <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <div className="relative">
            <input
                type={type}
                value={value || ""}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors ${disabled ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-800/50 dark:border-gray-700" : "border-gray-200 dark:border-gray-700"
                    }`}
            />
            {icon && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    {icon}
                </div>
            )}
        </div>
    </div>
);

const UserProfile: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    // Local state for edits
    const [formData, setFormData] = useState<any>({});

    const { data: updatedUser } = useQuery({
        queryKey: ['profile', user?.phone_number],
        queryFn: () => fetchProfile(user?.phone_number || ''),
        enabled: !!user?.phone_number,
    });

    useEffect(() => {
        if (updatedUser) {
            dispatch(setCredentials({ user: updatedUser }));
            setFormData(updatedUser);
        } else if (user) {
            setFormData(user);
        }
    }, [updatedUser, user, dispatch]);

    const queryClient = useQueryClient();

    const { mutate: updateMutation, isPending: isUpdating } = useMutation({
        mutationFn: (data: any) => {
            const id = user?.unique_id || formData?.unique_id || (user as any)?.userId || data?.userId || data?.unique_id;
            console.log("Attempting to update profile for ID:", id);
            console.log("Payload being sent:", data);

            if (!id) {
                console.error("Critical: User ID missing for update!");
                throw new Error("User ID is missing. Please try logging in again.");
            }
            return updateProfile(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile', user?.phone_number] });
            alert("Profile updated successfully!");
        },
        onError: (error: any) => {
            console.error("Update failed. Full error object:", error);
            const detail = error.response?.data?.detail;
            const message = error.response?.data?.message || error.message;

            let errorMessage = `Failed to update profile: ${message}`;
            if (detail) {
                if (Array.isArray(detail)) {
                    const detailMsg = detail.map((d: any) => `${d.loc?.join('.')} : ${d.msg}`).join('\n');
                    errorMessage += `\n\nValidation Errors:\n${detailMsg}`;
                    console.error("Validation details:", detailMsg);
                } else if (typeof detail === 'string') {
                    errorMessage += `\n\nDetails: ${detail}`;
                }
            }

            alert(errorMessage);
        }
    });

    const handleInputChange = (field: string, value: string) => {
        // Prevent alphabets for Phone Number and Pincode and enforce length
        if (field === 'phone_number') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData((prev: any) => ({ ...prev, [field]: numericValue }));
            return;
        }

        if (field === 'pincode') {
            const numericValue = value.replace(/\D/g, '').slice(0, 6);
            setFormData((prev: any) => ({ ...prev, [field]: numericValue }));
            return;
        }

        // Prevent numbers for Village, Mandal, District, and State
        const locationFields = ['village', 'mandal', 'district', 'state'];
        if (locationFields.includes(field)) {
            const sanitizedValue = value.replace(/[0-9]/g, '');
            setFormData((prev: any) => ({ ...prev, [field]: sanitizedValue }));
        } else {
            setFormData((prev: any) => ({ ...prev, [field]: value }));
        }
    };

    const handleSave = () => {
        console.log("Save button clicked, formData:", formData);
        updateMutation(formData);
    };


    if (!user) return null;

    const renderStats = () => {
        if (user.role === "ADMIN") {
            return (
                <div className="grid grid-cols-1 gap-4">
                    <div className="p-6 bg-brand-500 rounded-2xl text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Total Agriculture Officers</p>
                                <h4 className="text-3xl font-bold mt-1">{user.officer_count ?? 0}</h4>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <UserCircleIcon className="size-8" />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        if (user.role === "FIELD_OFFICER") {
            return (
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-blue-500 rounded-2xl text-white col-span-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Total Agents</p>
                                <h4 className="text-3xl font-bold mt-1">{user.agent_count ?? 0}</h4>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <GroupIcon className="size-8" />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-purple-500 rounded-2xl text-white">
                        <p className="text-xs opacity-80">Total Farmers</p>
                        <h4 className="text-2xl font-bold mt-1">{user.farmer_count ?? 0}</h4>
                    </div>
                    <div className="p-4 bg-emerald-500 rounded-2xl text-white">
                        <p className="text-xs opacity-80">Total Farms</p>
                        <h4 className="text-2xl font-bold mt-1">{user.land_count ?? 0}</h4>
                    </div>
                    <div className="p-4 bg-orange-500 rounded-2xl text-white col-span-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Total Acres</p>
                                <h4 className="text-3xl font-bold mt-1">{user.total_acres ?? 0}</h4>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <span className="text-xl font-bold">Ac</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        if (user.role === "AGENT") {
            return (
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-orange-500 rounded-2xl text-white col-span-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Total Farmers</p>
                                <h4 className="text-3xl font-bold mt-1">{user.farmer_count ?? 0}</h4>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <UserIcon className="size-8" />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-emerald-500 rounded-2xl text-white">
                        <p className="text-xs opacity-80">Total Farms</p>
                        <h4 className="text-2xl font-bold mt-1">{user.land_count ?? 0}</h4>
                    </div>
                    <div className="p-4 bg-blue-500 rounded-2xl text-white">
                        <p className="text-xs opacity-80">Total Acres</p>
                        <h4 className="text-2xl font-bold mt-1">{user.total_acres ?? 0}</h4>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account settings and platform preferences</p>
                </div>
                <div>
                    <Button
                        variant="outline"
                        startIcon={<LogoutIcon className="size-5" />}
                        onClick={() => {
                            dispatch(logout());
                            navigate("/signin");
                        }}
                    >
                        Logout
                    </Button>
                </div>
            </div>

            {/* Profile Information Card with New Admin Look */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/20 overflow-hidden">
                {/* Banner Section */}
                <div className="h-40 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 relative">
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#374151_1px,transparent_1px)]"></div>
                </div>

                {/* Profile Header Section */}
                <div className="px-8 pb-8 relative">
                    <div className="flex flex-col items-start -mt-16 sm:-mt-20">
                        {/* Overlapping Avatar */}
                        <div className="relative inline-block">
                            <div className="size-32 sm:size-40 rounded-full border-8 border-white dark:border-gray-800 shadow-2xl overflow-hidden bg-white">
                                <img
                                    src={formData.user_image_url || "/images/user/owner.jpg"}
                                    alt="Profile"
                                    className="size-full object-cover"
                                    onError={(e) => (e.currentTarget.src = "/images/user/owner.jpg")}
                                />
                            </div>
                            <div className="absolute bottom-4 right-4 bg-green-600 text-white p-2.5 rounded-full border-4 border-white dark:border-gray-800 shadow-lg cursor-pointer transform hover:scale-110 transition-transform">
                                <PencilIcon className="size-4" />
                            </div>
                        </div>

                        {/* Name and Badge Section */}
                        <div className="mt-6 flex flex-col gap-2">
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                {formData.first_name} {formData.last_name || 'Admin'}
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100 uppercase tracking-widest">
                                    {formData.role || 'Admin'}
                                </span>
                                <span className="text-sm font-medium text-gray-400">
                                    ID: <span className="text-gray-500 font-bold">{formData.unique_id || 'PENDING'}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Form Fields Section */}
                    <div className="mt-12 space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">General Information</h3>
                                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700 ml-6"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <InputField
                                    label="First Name"
                                    value={formData.first_name}
                                    placeholder="First name"
                                    onChange={(e: any) => handleInputChange('first_name', e.target.value)}
                                />
                                <InputField
                                    label="Last Name"
                                    value={formData.last_name}
                                    placeholder="Last name"
                                    onChange={(e: any) => handleInputChange('last_name', e.target.value)}
                                />
                                <InputField
                                    label="Email Address"
                                    value={formData.email}
                                    onChange={(e: any) => handleInputChange('email', e.target.value)}
                                />
                                <InputField
                                    label="Phone Number"
                                    value={formData.phone_number}
                                    onChange={(e: any) => handleInputChange('phone_number', e.target.value)}
                                />
                                <InputField
                                    label="Role"
                                    value={formData.role}
                                    disabled={true}
                                />
                                <InputField
                                    label="Date of Birth"
                                    type="date"
                                    value={(formData.date_of_birth || "").split('T')[0]}
                                    onChange={(e: any) => handleInputChange('date_of_birth', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Location Details integrated */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Location Details</h3>
                                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700 ml-6"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <InputField
                                    label="Village"
                                    value={formData.village}
                                    onChange={(e: any) => handleInputChange('village', e.target.value)}
                                />
                                <InputField
                                    label="Mandal"
                                    value={formData.mandal}
                                    onChange={(e: any) => handleInputChange('mandal', e.target.value)}
                                />
                                <InputField
                                    label="District"
                                    value={formData.district}
                                    onChange={(e: any) => handleInputChange('district', e.target.value)}
                                />
                                <InputField
                                    label="State"
                                    value={formData.state}
                                    onChange={(e: any) => handleInputChange('state', e.target.value)}
                                />
                                <InputField
                                    label="Pincode"
                                    value={formData.pincode}
                                    onChange={(e: any) => handleInputChange('pincode', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Action */}
                    <div className="px-8 py-5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                        <Button variant="outline" className="border-gray-200" onClick={() => setFormData(user)}>
                            Reset Changes
                        </Button>
                        <Button
                            className="px-8 shadow-lg shadow-green-600/20"
                            onClick={handleSave}
                            disabled={isUpdating}
                        >
                            {isUpdating ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Account Overview - Moved outside main card as requested before */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Overview</h3>
                {renderStats()}
            </div>

            {/* Fodder Procurement Section - Button only for navigation */}
            <div className="mt-8">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/fodder')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        Go to Fodder Procurement
                    </button>
                    <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700 ml-6"></div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-8 border-t border-gray-200 dark:border-gray-800 mt-8 pb-10">
                <p className="text-sm text-gray-500">© 2026 Landify Cultivation Management System. All rights reserved.</p>
            </div>
        </div>
    );
};

export default UserProfile;
