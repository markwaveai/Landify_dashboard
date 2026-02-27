import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getOfficerProfile, getAgentFarmers } from "../../services/userService";
import {
    UserIcon,
    GridIcon,
    AngleLeftIcon,
    DocsIcon,
    UserCircleIcon,
    BoxIcon,
    CheckCircleIcon,
    RupeeLineIcon
} from "../../icons";
import Badge from "../../components/ui/badge/Badge";
import PageMeta from "../../components/common/PageMeta";
import UserTable from "../../components/dashboard/UserTable";

// Custom Info Card Component
const InfoCard = ({ title, icon, children }: { title: string, icon?: React.ReactNode, children: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden h-full flex flex-col">
        <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-700/50 flex items-center gap-3 bg-gray-50/30 dark:bg-gray-800/50">
            {icon && <div className="text-brand-600 bg-brand-50 dark:bg-brand-900/20 p-2 rounded-lg">{icon}</div>}
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base">{title}</h3>
        </div>
        <div className="p-5 flex-1">
            <div className="space-y-5">
                {children}
            </div>
        </div>
    </div>
);

// Custom Field Component
const Field = ({ label, value, isLink, href }: { label: string, value: string | undefined, isLink?: boolean, href?: string }) => (
    <div className="group">
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
        {isLink && href ? (
            <a href={href} className="font-medium text-brand-600 hover:text-brand-700 hover:underline text-sm truncate block transition-colors">
                {value || "-"}
            </a>
        ) : (
            <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm leading-relaxed break-words">
                {value || <span className="text-gray-300 font-normal italic">Not provided</span>}
            </p>
        )}
    </div>
);

// Stat Card Component
const StatCard = ({ label, value, colorClass, icon }: { label: string, value: string | number, colorClass: string, icon?: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 hover:border-brand-100 transition-colors">
        <div className={`size-12 rounded-xl flex items-center justify-center ${colorClass} bg-opacity-10 text-xl`}>
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-2xl font-black text-gray-800 dark:text-white">{value}</p>
        </div>
    </div>
);

export default function OfficerDetailsPage() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const { data: profile, isLoading: isLoadingProfile } = useQuery({
        queryKey: ['officerProfile', userId],
        queryFn: () => getOfficerProfile(userId!),
        enabled: !!userId
    });

    const { data: agents, isLoading: isLoadingAgents } = useQuery({
        queryKey: ['officerAgents', profile?.unique_id],
        queryFn: () => getAgentFarmers(profile?.unique_id!),
        enabled: !!profile?.unique_id
    });

    if (isLoadingProfile) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="text-gray-300 mb-4">
                    <UserCircleIcon className="size-20" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Officer Not Found</h2>
                <p className="text-gray-500 mt-2">The field officer with this identifier could not be located.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-6 px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const assignedAgents = agents?.filter((u: any) => u.role === 'AGENT') || [];

    // Aggregate statistics from assigned agents
    const totalLandCount = assignedAgents.reduce((sum: number, agent: any) => sum + (agent.land_count || 0), 0);
    const totalAcresCount = assignedAgents.reduce((sum: number, agent: any) => sum + (agent.total_acres || 0), 0);
    const totalFarmerCount = assignedAgents.reduce((sum: number, agent: any) => sum + (agent.farmer_count || 0), 0);

    // Use profile values as primary, but fallback to aggregated totals if they seem more accurate (greater than zero)
    const displayLandCount = Math.max(profile.land_count || 0, totalLandCount);
    const displayTotalAcres = Math.max(profile.total_acres || 0, totalAcresCount).toFixed(2);
    const displayFarmerCount = Math.max(profile.farmer_count || 0, totalFarmerCount);

    return (
        <div className="space-y-8 pb-20 max-w-[1400px] mx-auto font-outfit">
            <PageMeta title={`${profile.first_name} ${profile.last_name} | Officer Details`} description="Officer Details" />

            {/* Back Button & Title */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2.5 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 hover:border-brand-200 transition-all text-gray-600"
                >
                    <AngleLeftIcon className="size-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        FO Profile
                    </h1>
                </div>
            </div>


            {/* Profile Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Profile Image */}
                        <div className="relative group">
                            <div className="size-36 rounded-[2rem] border-[6px] border-white dark:border-gray-800 overflow-hidden bg-white shadow-xl shadow-gray-200/50 dark:shadow-none">
                                {profile.user_image_url ? (
                                    <img
                                        src={profile.user_image_url}
                                        alt="Profile"
                                        className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => (e.currentTarget.src = "https://ui-avatars.com/api/?name=" + profile.first_name + "+" + profile.last_name + "&background=random")}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-brand-50 text-brand-500 text-5xl font-black uppercase">
                                        {profile.first_name?.[0]}
                                    </div>
                                )}
                            </div>
                            <div className={`absolute bottom-4 right-4 size-5 rounded-full border-4 border-white dark:border-gray-800 ${profile.is_active !== false ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>

                        {/* Name & Basic Info */}
                        <div className="flex-1 pt-4 lg:pt-18">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">
                                        {profile.first_name} <span className="text-gray-400 dark:text-gray-500">{profile.last_name}</span>
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Badge color="success" size="md">FIELD OFFICER</Badge>
                                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 hidden sm:block"></div>
                                        <span className="text-sm font-mono font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded">
                                            {profile.unique_id || 'NO-ID'}
                                        </span>
                                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 hidden sm:block"></div>
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                                            <GridIcon className="size-4" />
                                            <span>{profile.mandal || 'No Mandal'}, {profile.district || 'No District'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Header Stats */}
                                <div className="flex gap-4">
                                    <StatCard
                                        label="Agents"
                                        value={assignedAgents.length}
                                        colorClass="text-blue-600 bg-blue-500"
                                        icon={<UserIcon className="size-6" />}
                                    />
                                    <StatCard
                                        label="Farmers"
                                        value={displayFarmerCount}
                                        colorClass="text-orange-600 bg-orange-500"
                                        icon={<UserCircleIcon className="size-6" />}
                                    />
                                    <StatCard
                                        label="Land Count"
                                        value={displayLandCount}
                                        colorClass="text-emerald-600 bg-emerald-500"
                                        icon={<GridIcon className="size-6" />}
                                    />
                                    <StatCard
                                        label="Total Acres"
                                        value={displayTotalAcres}
                                        colorClass="text-purple-600 bg-purple-500"
                                        icon={<BoxIcon className="size-6" />}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Land Statistics Section */}
            {/* {profile.land_stats && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Land Approval Statistics</h3>
                        <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1 ml-2"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                            <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Active</p>
                            <h4 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">{profile.land_stats.active_lands || 0}</h4>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl border border-orange-100 dark:border-orange-800/50">
                            <p className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-1">Harvest Ready</p>
                            <h4 className="text-xl font-bold text-orange-900 dark:text-orange-100">{profile.land_stats.harvest_ready || 0}</h4>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-2xl border border-purple-100 dark:border-purple-800/50">
                            <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">Approved</p>
                            <h4 className="text-xl font-bold text-purple-900 dark:text-purple-100">{profile.land_stats.approved_lands || 0}</h4>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-2xl border border-yellow-100 dark:border-yellow-800/50">
                            <p className="text-[10px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-widest mb-1">Review</p>
                            <h4 className="text-xl font-bold text-yellow-900 dark:text-yellow-100">{profile.land_stats.review_lands || 0}</h4>
                        </div>
                        <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-800/50">
                            <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">Remarks</p>
                            <h4 className="text-xl font-bold text-rose-900 dark:text-rose-100">{profile.land_stats.remarks_lands || 0}</h4>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-800/50">
                            <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">Rejected</p>
                            <h4 className="text-xl font-bold text-red-900 dark:text-red-100">{profile.land_stats.rejected_lands || 0}</h4>
                        </div>
                    </div>
                </div>
            )} */}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Personal Information */}
                <InfoCard title="Personal Information" icon={<UserCircleIcon className="size-5" />}>
                    <Field label="Full Name" value={`${profile.first_name} ${profile.last_name}`} />
                    <Field label="Phone Number" value={profile.phone_number} isLink href={`tel:${profile.phone_number}`} />
                    <Field label="Email Address" value={profile.email} isLink href={`mailto:${profile.email}`} />
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Gender" value={profile.gender} />
                        <Field label="Date of Birth" value={profile.date_of_birth} />
                    </div>
                    <Field label="Alternate Phone" value={profile.alternate_phone_number} />
                </InfoCard>

                {/* KYC & Address */}
                <InfoCard title="KYC & Location" icon={<BoxIcon className="size-5" />}>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Reference ID" value={profile.reference_id} />
                        <Field label="Aadhar Number" value={profile.aadhar_card_number} />
                        <Field label="PAN Number" value={profile.pan_number} />
                    </div>

                    <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-bold text-gray-900 dark:text-white uppercase mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span> Address Details
                        </p>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Mandal" value={profile.mandal} />
                                <Field label="Village" value={profile.village} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="District" value={profile.district} />
                                <Field label="State" value={profile.state} />
                            </div>
                            <Field label="Pincode" value={profile.pincode} />
                        </div>
                    </div>
                </InfoCard>

                {/* Bank Information */}
                <InfoCard title="Financial Details" icon={<RupeeLineIcon className="size-5" />}>
                    <Field label="Account Holder Name" value={profile.account_name || profile.first_name + " " + profile.last_name} />
                    <Field label="Bank Name" value={profile.bank_name} />
                    <Field label="Account Number" value={profile.account_number} />
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="IFSC Code" value={profile.ifsc_code} />
                        <Field label="Branch" value={profile.bank_branch} />
                    </div>
                </InfoCard>
            </div>

            {/* Documents Section */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Verification Documents</h3>
                    <div className="h-px bg-gray-200 flex-1 ml-2"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                    {[
                        { label: "Aadhar Card", url: profile.aadhar_image_url, type: 'ID Proof' },
                        { label: "PAN Card", url: profile.pan_image_url, type: 'ID Proof' },
                        { label: "Bank Passbook", url: profile.bank_passbook_image_url, type: 'Financial' },
                        { label: "User Photo", url: profile.user_image_url, type: 'Personal' },
                        { label: "Agreement", url: profile.agreement_url, type: 'Legal' },
                    ].map((doc, i) => (
                        <div
                            key={i}
                            className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${doc.url
                                ? 'bg-white border-gray-200 shadow-sm hover:shadow-lg hover:border-brand-300 hover:-translate-y-1'
                                : 'bg-gray-50 border-gray-100 border-dashed opacity-70'
                                }`}
                        >
                            <div className="h-32 bg-gray-100 dark:bg-gray-800 relative flex items-center justify-center overflow-hidden">
                                {doc.url ? (
                                    <img src={doc.url} alt={doc.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                ) : (
                                    <DocsIcon className="size-10 text-gray-300" />
                                )}
                                {doc.url && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full text-brand-600 hover:scale-110 transition-transform">
                                            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">{doc.type}</p>
                                    {doc.url ? (
                                        <CheckCircleIcon className="size-3.5 text-green-500" />
                                    ) : (
                                        <div className="size-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                    )}
                                </div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">{doc.label}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {doc.url ? 'Preview available' : 'Not uploaded'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Assigned Agents List */}
            <div className="pt-4">
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Assigned Agents</h3>
                    <div className="h-px bg-gray-200 flex-1 ml-2"></div>
                </div>
                <UserTable
                    title="Agents List"
                    users={assignedAgents}
                    isLoading={isLoadingAgents}
                    onAddClick={undefined}
                    hideStatus={true}
                    showFarmerCount={true}
                    hideAction={true}
                    hideDetailedLocation={true}
                    itemsPerPage={5}
                />
            </div>
        </div>
    );
}
