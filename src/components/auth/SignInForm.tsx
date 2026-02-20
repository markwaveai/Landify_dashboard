import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useSnackbar } from "../../context/SnackbarContext";
import Label from "../form/Label";
import { useDispatch } from "react-redux";
import { sendOTP, fetchProfile, verifyOTP, sendStaticOTP } from "../../services/authService";
import { setCredentials } from "../../store/slices/authSlice";

export default function SignInForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const sanitizedPhone = phoneNumber.trim().replace(/\D/g, ""); // Keep only digits

      if (sanitizedPhone === "9999999999") {
        console.log("Calling static OTP endpoint for 9999999999");
        await sendStaticOTP(sanitizedPhone);
        setOtpSent(true);
        setOtp("123456");
        setLoading(false);
        return;
      }

      await sendOTP(sanitizedPhone);
      setOtpSent(true);
      showSnackbar("OTP Sent Successfully", "success");
    } catch (err: any) {
      console.error(err);
      setError("Failed to send OTP. Check phone number.");
      showSnackbar("Failed to send OTP. Check phone number.", "error");
    } finally {
      if (phoneNumber !== "9999999999") {
        setLoading(false);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const sanitizedPhone = phoneNumber.trim().replace(/\D/g, "");
      const sanitizedOtp = otp.trim().replace(/\s/g, "");

      console.log("Attempting login for:", sanitizedPhone, "with OTP:", sanitizedOtp);

      await verifyOTP(sanitizedPhone, sanitizedOtp);
      localStorage.setItem('user_phone', sanitizedPhone);
      const user = await fetchProfile(sanitizedPhone);
      dispatch(setCredentials({ user }));
      showSnackbar("Login successful!", "success");
      navigate("/");
    } catch (err: any) {
      console.error("Login Error:", err);
      const backendMessage = err.response?.data?.detail || err.response?.data?.message || "Identity verification failed.";
      setError(`Login failed. ${backendMessage}`);
      showSnackbar(`Login failed. ${backendMessage}`, "error");
      localStorage.removeItem('user_phone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-theme-lg">
          <img src="/landify_logo.jpeg" className="w-8 h-8 object-contain rounded-lg" alt="Logo" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
        <p className="text-gray-500">
          Welcome back! Please enter your phone number and OTP to manage the cultivation systems.
        </p>
      </div>

      <form onSubmit={otpSent ? handleLogin : handleSendOTP} className="space-y-6">
        <div>
          <Label className="text-gray-700 font-medium mb-2 block">Phone Number</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-bold">
              +91
            </span>
            <input
              type="text"
              placeholder="Enter phone number"
              value={phoneNumber}
              disabled={otpSent}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setPhoneNumber(val);
              }}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none"
            />
          </div>
        </div>

        {otpSent && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-gray-700 font-medium block">OTP Verification</Label>
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                Change?
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="••••••"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none tracking-[0.5em] font-bold"
              />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-error-500 font-medium px-1">{error}</p>}

        <div className="flex items-center gap-3">
          <input type="checkbox" id="remember" className="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
          <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">Remember this device for 30 days</label>
        </div>

        <button
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand-600/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              {otpSent ? "Login to Dashboard" : "Get Verification Code"}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.9L9.03 9.155a2.003 2.003 0 002.166 0L18.1 4.9A2 2 0 0017.025 2H3.1a2 2 0 00-.934 2.9zm16.142 2.768A2 2 0 0017.208 8H2.792a2 2 0 00-.923.22L9.03 12.564a2.003 2.003 0 002.166 0l7.161-4.426a2 2 0 00-.916-.47z" clipRule="evenodd" />
          </svg>
          Secure Admin Access Only
        </div>
        <p className="text-[10px] text-gray-400 max-w-[280px] mx-auto leading-relaxed">
          Protected by industry-standard 256-bit encryption. <br /> © 2024 Landify Agri-Tech Solutions.
        </p>
      </div>
    </div>
  );
}

