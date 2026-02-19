import React, { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { DocsIcon, LockIcon, CheckCircleIcon, InfoIcon, GroupIcon, BoxCubeIcon, DollarLineIcon } from "../../icons";

const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md group">
        <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-700/50 flex items-center gap-3 bg-gray-50/30 dark:bg-gray-800/50 group-hover:bg-green-50/30 dark:group-hover:bg-green-900/10 transition-colors">
            <div className="text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg uppercase tracking-tight">{title}</h3>
        </div>
        <div className="p-6">
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed font-medium space-y-4">
                {children}
            </div>
        </div>
    </div>
);

const ListItem = ({ children }: { children: React.ReactNode }) => (
    <div className="flex gap-3 mb-3">
        <div className="mt-1 flex-shrink-0">
            <CheckCircleIcon className="size-4 text-green-500" />
        </div>
        <div className="text-sm font-medium">{children}</div>
    </div>
);

export default function LegalPage() {
    const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');

    return (
        <div className="min-h-screen pb-20 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageMeta title="Legal | Landify" description="Terms, Conditions, and Privacy Policy" />

            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#154732] p-8 lg:p-12 text-white shadow-2xl">
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 opacity-10">
                    <DocsIcon className="size-64" />
                </div>
                <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest text-green-200">
                        <LockIcon className="size-3" />
                        Landify Governance
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
                        Legal <span className="text-green-400">Compliance</span>
                    </h1>
                    <p className="max-w-2xl text-lg text-green-100/80 font-medium">
                        Review the terms, conditions, and privacy protocols that govern our fodder procurement and supply ecosystem.
                        We prioritize transparency, quality, and data integrity.
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-2xl w-full max-w-md mx-auto border border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('terms')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${activeTab === 'terms'
                            ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'
                        }`}
                >
                    <DocsIcon className="size-4" />
                    Terms & Conditions
                </button>
                <button
                    onClick={() => setActiveTab('privacy')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${activeTab === 'privacy'
                            ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'
                        }`}
                >
                    <LockIcon className="size-4" />
                    Privacy Policy
                </button>
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                {activeTab === 'terms' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-500">
                        <div className="md:col-span-2">
                            <Section title="1. Scope of Services" icon={<BoxCubeIcon className="size-5" />}>
                                <p>
                                    The platform facilitates fodder procurement, aggregation, logistics coordination, and supply management for the
                                    <span className="text-green-600 dark:text-green-400 font-bold"> Kurnool sub-branch farm</span> and its associated sourcing locations including
                                    Adoni, Veldurthi, and Krishnagiri.
                                </p>
                            </Section>
                        </div>

                        <Section title="2. Eligibility" icon={<GroupIcon className="size-5" />}>
                            <p>Participation is open to:</p>
                            <ListItem>Registered farmers</ListItem>
                            <ListItem>Authorized field agents</ListItem>
                            <ListItem>Logistics partners</ListItem>
                            <ListItem>Internal operational staff</ListItem>
                            <p className="text-xs italic mt-2 opacity-70">Requires onboarding and verification requirements defined by the company.</p>
                        </Section>

                        <Section title="3. Farmer Responsibilities" icon={<DocsIcon className="size-5" />}>
                            <ListItem>Supply fodder meeting quality standards (moisture, freshness, contamination).</ListItem>
                            <ListItem>Accurate declaration of acreage and expected yield.</ListItem>
                            <ListItem>Adherence to harvest schedules agreed with agents.</ListItem>
                            <ListItem>Advance communication of crop failures or yield reduction.</ListItem>
                        </Section>

                        <Section title="4. Agent Responsibilities" icon={<InfoIcon className="size-5" />}>
                            <ListItem>Farmer coordination and acreage coverage.</ListItem>
                            <ListItem>Harvest planning and quality inspection.</ListItem>
                            <ListItem>Transparent record-keeping and timely reporting.</ListItem>
                            <ListItem>Zero tolerance for misrepresentation of data.</ListItem>
                        </Section>

                        <Section title="5. Pricing & Payments" icon={<DollarLineIcon className="size-5" />}>
                            <ListItem>Determined by quality, season, and commercial terms.</ListItem>
                            <ListItem>Processed only after quality verification and delivery.</ListItem>
                            <ListItem>No liability for delays due to incorrect info or rejection.</ListItem>
                        </Section>

                        <Section title="6. Quality Control" icon={<CheckCircleIcon className="size-5" />}>
                            <p>
                                The company reserves the right to inspect, test, accept, or reject fodder based on internal quality benchmarks.
                                <span className="font-bold text-red-500 ml-1">Rejected fodder will not be eligible for payment.</span>
                            </p>
                        </Section>

                        <Section title="7. Logistics & Delivery" icon={<BoxCubeIcon className="size-5" />}>
                            <p>
                                Schedules are coordinated centrally. Delays caused by weather, road conditions, or force majeure events
                                will not be considered a breach of contract.
                            </p>
                        </Section>

                        <Section title="8. Data Accuracy" icon={<InfoIcon className="size-5" />}>
                            <p>
                                Users are responsible for maintaining accurate info. Company is not liable for operational losses
                                caused by incorrect/incomplete data.
                            </p>
                        </Section>

                        <Section title="9. Termination" icon={<LockIcon className="size-5" />}>
                            <p>
                                Access may be suspended for:
                            </p>
                            <ListItem>Fraudulent activities</ListItem>
                            <ListItem>Repeated quality failures</ListItem>
                            <ListItem>Breach of operational guidelines</ListItem>
                        </Section>

                        <Section title="10. Modifications" icon={<DocsIcon className="size-5" />}>
                            <p>
                                Terms may be updated periodically. Continued participation implies acceptance of revised terms.
                            </p>
                        </Section>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-500">
                        <Section title="1. Information Collected" icon={<LockIcon className="size-5" />}>
                            <ListItem>Farmer details (name, location, land size, crop type)</ListItem>
                            <ListItem>Agent details (contact information, assigned acreage)</ListItem>
                            <ListItem>Operational data (harvest schedules, delivery records)</ListItem>
                            <ListItem>Transaction and payment-related information</ListItem>
                        </Section>

                        <Section title="2. Use of Information" icon={<InfoIcon className="size-5" />}>
                            <p>Information is used solely for:</p>
                            <ListItem>Procurement planning & Logistics coordination</ListItem>
                            <ListItem>Payment processing</ListItem>
                            <ListItem>Operational analytics and reporting</ListItem>
                        </Section>

                        <Section title="3. Data Sharing" icon={<GroupIcon className="size-5" />}>
                            <p>
                                Data shared only with authorized personnel, logistics, or payment partners.
                                <span className="font-bold text-green-600 block mt-2 underline">We do not sell or rent personal data.</span>
                            </p>
                        </Section>

                        <Section title="4. Data Security" icon={<CheckCircleIcon className="size-5" />}>
                            <p>
                                Technical and organizational measures are in place to protect data against
                                unauthorized access, misuse, or loss.
                            </p>
                        </Section>

                        <Section title="5. Data Retention" icon={<BoxCubeIcon className="size-5" />}>
                            <p>
                                Data is retained only as long as necessary to fulfill operational, legal, and audit requirements.
                            </p>
                        </Section>

                        <Section title="6. User Rights" icon={<GroupIcon className="size-5" />}>
                            <p>
                                Users may request access, correction, or deletion of their data, subject to legal constraints.
                            </p>
                        </Section>

                        <Section title="7. Policy Updates" icon={<DocsIcon className="size-5" />}>
                            <p>
                                Privacy policies may be updated periodically. Continued use indicates acceptance.
                            </p>
                        </Section>
                    </div>
                )}
            </div>

            {/* Footer Info */}
            <div className="text-center py-8 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    © {new Date().getFullYear()} Landify Assets. All legal protections apply.
                    <br />
                    Kurnool Sub-Branch Operations.
                </p>
            </div>
        </div>
    );
}
