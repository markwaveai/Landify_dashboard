import { useState } from "react";
import { useNavigate } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useDispatch } from "react-redux";
import { login, fetchMe } from "../../services/authService";
import { setCredentials } from "../../store/slices/authSlice";

export default function SignInForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("1234"); // Default OTP as per backend
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { access_token } = await login(phoneNumber, otp);
      // Store token first
      localStorage.setItem('token', access_token);
      // Fetch user details
      const user = await fetchMe();

      dispatch(setCredentials({ user, token: access_token }));
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError("Login failed. Check phone number and OTP.");
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
          </div>
          <div>
            <form onSubmit={handleLogin}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Phone Number <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e: any) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    OTP <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter OTP (default 1234)"
                      value={otp}
                      onChange={(e: any) => setOtp(e.target.value)}
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-error-500">{error}</p>}

                <div>
                  <Button className="w-full" size="sm" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
