import React, { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { ChevronDownIcon, EnvelopeIcon, GroupIcon, ChatIcon } from "../../icons";

interface FAQItemProps {
    question: string;
    answer: string;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-5 text-left transition-all group"
            >
                <span className={`text-sm font-bold transition-colors ${isOpen ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300 group-hover:text-green-600'}`}>
                    {question}
                </span>
                <ChevronDownIcon
                    className={`size-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-green-500' : ''}`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100 pb-5' : 'max-h-0 opacity-0'}`}
            >
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                    {answer}
                </p>
            </div>
        </div>
    );
};

export default function SupportPage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate form submission
        alert("Support message sent successfully!");
        setFormData({ firstName: "", lastName: "", email: "", phone: "", message: "" });
    };

    const faqs = [
        {
            question: "How much fodder does the Kurnool farm require annually?",
            answer: "The Kurnool sub-branch farm requires approximately 15,000 to 20,000 metric tons of fodder annually to sustain its livestock operations."
        },
        {
            question: "Which regions supply fodder to the Kurnool farm?",
            answer: "Our primary sourcing clusters are located in Adoni, Veldurthi, and Krishnagiri, ensuring a diverse and reliable supply chain."
        },
        {
            question: "How much land is required to meet the fodder demand?",
            answer: "To meet current demand, we coordinate cultivation across approximately 2,800 acres of dedicated fodder land."
        },
        {
            question: "How many agents are involved in the operation?",
            answer: "Currently, over 50 authorized field agents manage the ground-level coordination between farmers and our logistics network."
        },
        {
            question: "How many farmers typically work with one agent?",
            answer: "Each agent typically manages a cluster of 60 to 80 farmers, ensuring personalized support and quality oversight."
        },
        {
            question: "What is the average daily fodder intake of the farm?",
            answer: "The farm consumes an average of 45-50 metric tons of fresh fodder every single day."
        },
        {
            question: "How is fodder transported?",
            answer: "Fodder is moved via specialized multi-axle trucks and coordinated tractor fleets for shorter distances from sourcing hubs."
        },
        {
            question: "Is fodder quality checked before acceptance?",
            answer: "Yes, every shipment undergoes a multi-point quality check including moisture levels, protein content, and visual freshness inspection."
        },
        {
            question: "How much buffer stock is maintained?",
            answer: "We maintain a minimum of 10-14 days of buffer stock at all times to mitigate seasonal variations or logistics delays."
        },
        {
            question: "What happens if fodder quality does not meet standards?",
            answer: "Fodder that fails quality inspections is rejected at the entry point and returned to the agent/farmer with a detailed rejection report."
        }
    ];

    return (
        <div className="min-h-screen pb-20 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageMeta title="Support | Landify" description="Get help with Landify services" />

            {/* Header Section */}
            <div className="text-center space-y-4 mb-16 pt-8">
                <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                    Landify <span className="text-green-600">Support</span>
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
                    We are here to help. Check our FAQs below or fill out the form to get in touch with our team.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* FAQ Section */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="flex items-center gap-3 border-l-4 border-green-600 pl-4 py-1">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/40 dark:shadow-none p-6 md:p-8">
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {faqs.map((faq, index) => (
                                <FAQItem key={index} {...faq} />
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-6 p-6 md:p-8 bg-green-50 dark:bg-green-900/10 rounded-3xl border border-green-100 dark:border-green-800/50">
                        <div className="bg-green-600 p-3 rounded-2xl text-white">
                            <ChatIcon className="size-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Still have questions?</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Can't find the answer you're looking for? Please chat with our friendly team.</p>
                        </div>
                    </div>
                </div>

                {/* Contact Form Section */}
                <div className="lg:col-span-5">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-2xl shadow-gray-200/50 dark:shadow-none overflow-hidden h-full">
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">Send us a message</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Fill out the form and our team will get back to you within 24 hours.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">First Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter First Name"
                                            required
                                            value={formData.firstName}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (/^[a-zA-Z\s]*$/.test(val)) {
                                                    setFormData({ ...formData, firstName: val });
                                                }
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-sm font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Last Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter Last Name"
                                            required
                                            value={formData.lastName}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (/^[a-zA-Z\s]*$/.test(val)) {
                                                    setFormData({ ...formData, lastName: val });
                                                }
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-sm font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="Enter Email Address"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-sm font-medium"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        placeholder="Enter Phone Number"
                                        required
                                        maxLength={10}
                                        value={formData.phone}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            // Allow only digits, max 10
                                            if (/^\d*$/.test(val) && val.length <= 10) {
                                                setFormData({ ...formData, phone: val });
                                            }
                                        }}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-sm font-medium"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">How can we help you?</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Describe your issue or question..."
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-sm font-medium resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.98] mt-2"
                                >
                                    Send Message
                                </button>
                            </form>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col items-center text-center p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <EnvelopeIcon className="size-5 text-green-600 mb-2" />
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Support Email</span>
                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1">contact@markwave.ai</span>
                                </div>
                                <div className="flex flex-col items-center text-center p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <GroupIcon className="size-5 text-green-600 mb-2" />
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Office Contact</span>
                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1">+917702710290</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
