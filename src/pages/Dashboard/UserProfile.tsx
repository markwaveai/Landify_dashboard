import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { UserCircleIcon, GroupIcon, UserIcon, EnvelopeIcon, CalenderIcon } from "../../icons";
import Badge from "../../components/ui/badge/Badge";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "../../services/authService";
import { setCredentials } from "../../store/slices/authSlice";

const ProfileField = ({ label, value, icon }: { label: string; value: string | undefined; icon?: React.ReactNode }) => (
    <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl dark:border-gray-800">
        {icon && <div className="text-gray-400">{icon}</div>}
        <div>
            <p className="text-xs font-medium text-gray-400 uppercase">{label}</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{value || "N/A"}</p>
        </div>
    </div>
);

const UserProfile: React.FC = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);

    const { data: updatedUser } = useQuery({
        queryKey: ['profile', user?.phone_number],
        queryFn: () => fetchProfile(user?.phone_number || ''),
        enabled: !!user?.phone_number,
    });

    useEffect(() => {
        if (updatedUser) {
            dispatch(setCredentials({ user: updatedUser }));
        }
    }, [updatedUser, dispatch]);

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
        if (user.role === "AGRICULTURE_OFFICER") {
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
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="h-32 bg-gray-100 dark:bg-gray-800 relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="size-24 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-white shadow-lg">
                            <img src="/images/user/owner.jpg" alt="Profile" className="size-full object-cover" />
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-6 px-8 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{user.first_name} {user.last_name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge color="success" size="sm">{user.role}</Badge>
                            <span className="text-sm text-gray-500 font-medium">ID: {user.unique_id}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Basic Information</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <ProfileField label="Full Name" value={`${user.first_name} ${user.last_name}`} icon={<UserCircleIcon className="size-5" />} />
                            <ProfileField label="Phone Number" value={user.phone_number} icon={<UserIcon className="size-5" />} />
                            <ProfileField label="Email Address" value={user.email} icon={<EnvelopeIcon className="size-5" />} />
                            <ProfileField label="Date of Birth" value={user.date_of_birth?.toString()} icon={<CalenderIcon className="size-5" />} />
                        </div>
                    </div>

                    {renderStats()}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Location Details</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <ProfileField label="Village" value={user.village} />
                        <ProfileField label="Mandal" value={user.mandal} />
                        <ProfileField label="District" value={user.district} />
                        <ProfileField label="State" value={user.state} />
                        <ProfileField label="Pincode" value={user.pincode} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
