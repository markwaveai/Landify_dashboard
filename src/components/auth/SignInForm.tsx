import { useState } from "react";
import { useNavigate } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useDispatch } from "react-redux";
import { login, sendOTP, fetchProfile } from "../../services/authService";
import { setCredentials } from "../../store/slices/authSlice";

export default function SignInForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [receivedOtp, setReceivedOtp] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const sanitizedPhone = phoneNumber.trim().replace(/[\u200B-\u200D\u2028\u2029\uFEFF]/g, "");
      const data = await sendOTP(sanitizedPhone);
      setReceivedOtp(data.otp);
      setOtpSent(true);
      if (sanitizedPhone === "9999999999") {
        setOtp("123456");
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to send OTP. Check phone number.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp !== receivedOtp && phoneNumber !== "9999999999") {
      setError("Invalid OTP. Please try again.");
      return;
    }

    // Admin bypass for static login
    if (phoneNumber === "9999999999" && otp !== "123456") {
      setError("Invalid OTP for Admin.");
      return;
    }

    setLoading(true);
    try {
      const sanitizedPhone = phoneNumber.trim().replace(/[\u200B-\u200D\u2028\u2029\uFEFF]/g, "");

      // Verification - just to confirm user exists and for backend logging
      await login(sanitizedPhone, otp);


      // Store phone number first (so subsequent requests have the header)
      localStorage.setItem('user_phone', sanitizedPhone);

      // Fetch user details
      const user = await fetchProfile(sanitizedPhone);

      dispatch(setCredentials({ user }));

      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError("Login failed. Identity verification failed.");
      localStorage.removeItem('user_phone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your phone number and OTP to sign in!
            </p>
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                <strong>Admin Login:</strong> Phone <code>9999999999</code>, OTP <code>123456</code>
              </p>
            </div>
          </div>
          <div>
            <form onSubmit={otpSent ? handleLogin : handleSendOTP}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Phone Number <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    disabled={otpSent}
                    onChange={(e: any) => setPhoneNumber(e.target.value)}
                  />
                </div>

                {otpSent && (
                  <div>
                    <Label>
                      OTP <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e: any) => setOtp(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {error && <p className="text-sm text-error-500">{error}</p>}

                <div>
                  <Button className="w-full" size="sm" disabled={loading}>
                    {loading
                      ? (otpSent ? "Verifying..." : "Sending OTP...")
                      : (otpSent ? "Sign in" : "Send OTP")}
                  </Button>
                </div>

                {otpSent && (
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-xs text-brand-500 hover:text-brand-600 font-medium"
                  >
                    Change Phone Number
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

