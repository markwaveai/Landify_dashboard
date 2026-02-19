import React, { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useSnackbar } from "../../context/SnackbarContext";

const DeleteAccountPage: React.FC = () => {
    const [step, setStep] = useState(0); // 0: Enter Mobile, 1: Enter OTP
    const [formData, setFormData] = useState({
        mobile: "",
        otp: "",
    });
    const [loading, setLoading] = useState(false);
    const { showSnackbar } = useSnackbar();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.mobile) return;

        setLoading(true);
        try {
            const response = await fetch(
                `https://landify-backend-stagging-services-612299373064.asia-south2.run.app/users/send-otp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        accept: "application/json",
                    },
                    body: JSON.stringify({ mobile: formData.mobile }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to send OTP");
            }

            setStep(1);
            showSnackbar("OTP sent successfully", "success");
        } catch (err: any) {
            showSnackbar(err.message || "Error sending OTP", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!formData.otp) {
            showSnackbar("Please enter OTP", "error");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `https://landify-backend-stagging-services-612299373064.asia-south2.run.app/users/disable`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        accept: "application/json",
                    },
                    body: JSON.stringify({
                        mobile: formData.mobile,
                        otp: formData.otp,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete account");
            }

            showSnackbar("Account deleted successfully", "success");
            setStep(0);
            setFormData({ mobile: "", otp: "" });
        } catch (err: any) {
            showSnackbar(err.message || "Error deleting account", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <PageMeta title="Delete Account | Landify" description="Securely delete your Landify account" />

            <div className="bg-white dark:bg-gray-800 w-full max-w-5xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-700">

                {/* Left Side: Brand Illustration */}
                <div className="md:w-1/2 bg-white dark:bg-gray-800 p-12 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-50 dark:border-gray-700">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-green-400/10 blur-3xl rounded-full group-hover:bg-green-400/20 transition-all duration-700"></div>
                        <img
                            src="/landify_logo.jpeg"
                            alt="Landify Brand"
                            className="relative z-10 w-full max-w-[320px] object-contain transform group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=2070&auto=format&fit=crop";
                            }}
                        />
                    </div>
                </div>

                {/* Right Side: Action Form */}
                <div className="md:w-1/2 p-8 lg:p-16 flex flex-col justify-center bg-white dark:bg-gray-800/50">
                    <div className="text-center mb-10 space-y-2">
                        <h2 className="text-4xl font-black text-[#1a1f3c] dark:text-white tracking-tight">
                            {step === 0 ? "Delete Account" : "Verify OTP"}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            {step === 0 ? "We're sorry to see you go." : "Enter the code sent to your mobile phone."}
                        </p>
                    </div>

                    <div className="space-y-6">
                        {step === 0 ? (
                            <form onSubmit={handleSendOtp} className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <div className="group">
                                    <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 mb-2 ml-1 tracking-widest">Registered Mobile</label>
                                    <div className="relative flex items-center bg-[#f8fafc] dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl transition-all focus-within:ring-4 focus-within:ring-green-500/10 focus-within:border-green-500 overflow-hidden">
                                        <div className="pl-5 pr-4 py-4 text-gray-500 font-bold border-r border-gray-200/50 dark:border-gray-700">
                                            +91
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="Enter mobile number *"
                                            className="w-full px-5 py-4 bg-transparent outline-none text-gray-800 dark:text-white font-bold text-lg placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                            required
                                            value={formData.mobile}
                                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 bg-[#2a9d8f] hover:bg-[#238b7e] disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-black text-lg rounded-[1.25rem] shadow-xl shadow-green-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                                >
                                    {loading ? (
                                        <>
                                            <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        "Send OTP"
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <div className="group">
                                    <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 mb-2 ml-1 tracking-widest">Verification Code</label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="Enter 6-digit OTP"
                                        className="w-full px-6 py-5 bg-[#f8fafc] dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl text-center text-3xl font-black tracking-[0.4em] text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all placeholder:text-gray-200 dark:placeholder:text-gray-800 placeholder:tracking-normal placeholder:text-sm"
                                        value={formData.otp}
                                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                        disabled={loading}
                                    />
                                </div>

                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={handleDelete}
                                        disabled={loading || formData.otp.length < 4}
                                        className="w-full py-5 bg-red-500 hover:bg-red-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 text-white font-black text-lg rounded-[1.25rem] shadow-xl shadow-red-500/20 active:scale-[0.98] transition-all uppercase tracking-widest"
                                    >
                                        {loading ? "Deleting..." : "Confirm Deletion"}
                                    </button>

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setStep(0)}
                                            disabled={loading}
                                            className="flex-1 py-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold rounded-2xl transition-all uppercase text-xs tracking-widest"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleSendOtp}
                                            disabled={loading}
                                            className="flex-1 py-4 text-[#2a9d8f] dark:text-[#3ab9ab] font-black text-xs hover:underline uppercase tracking-widest"
                                        >
                                            Resend OTP
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-8 border-t border-gray-50 dark:border-gray-700 text-center">
                            <a
                                href="/legal"
                                className="text-xs font-bold text-gray-400 hover:text-gray-800 dark:text-gray-600 dark:hover:text-gray-300 transition-colors underline underline-offset-4"
                            >
                                Terms and Policy
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteAccountPage;
