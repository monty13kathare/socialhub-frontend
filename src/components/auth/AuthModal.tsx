import React, { useState, useRef } from "react";
import { X, Mail, Lock, User, ArrowLeft, Check } from "lucide-react";
import {
  completeProfile,
  loginUser,
  registerUser,
  verifyOtp,
} from "../../api/auth";
import { setToken } from "../../utils/cookieHelper";
import { setUser } from "../../utils/userStorage";
import { useNavigate } from "react-router-dom";

type AuthStep = "choice" | "signup" | "signin" | "otp" | "profile" | "success";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  username: string;
  avatar: File | null;
  bio: string;
  otp: string[];
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>("choice");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    username: "",
    avatar: null,
    bio: "",
    otp: ["", "", "", "", "", ""],
  });

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData((prev) => ({ ...prev, otp: newOtp }));

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !formData.otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const resetModal = () => {
    setStep("choice");
    setFormData({
      name: "",
      email: "",
      password: "",
      username: "",
      avatar: null,
      bio: "",
      otp: ["", "", "", "", "", ""],
    });
  };

  // 🧩 REGISTER
  const handleSignUp = async () => {
    try {
      setLoading(true);
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      setStep("otp");
    } catch (err: any) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 VERIFY OTP
  const handleOtpVerify = async () => {
    const otpCode = formData.otp.join("");
    if (otpCode.length !== 6) return alert("Please enter 6-digit OTP");

    try {
      setLoading(true);
      const res = await verifyOtp({ email: formData.email, otp: otpCode });

      // Save token if backend returns one
      if (res.data?.token) {
        setToken(res.data.token);
      }

      setStep("profile");
    } catch (err: any) {
      alert(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileComplete = async () => {
    try {
      setLoading(true);

      const data = new FormData();
      data.append("email", formData.email);
      data.append("username", formData.username);
      data.append("bio", formData.bio);
      if (formData.avatar) data.append("avatar", formData.avatar);

      const res = await completeProfile(data);
      setUser(res.data);
      navigate("/");
      window.location.reload();
      setStep("success");
    } catch (err: any) {
      alert(err.response?.data?.message || "Profile completion failed");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 LOGIN
  const handleSignIn = async () => {
    if (!formData.email || !formData.password)
      return alert("Enter credentials");
    try {
      setLoading(true);
      const res = await loginUser({
        email: formData.email,
        password: formData.password,
      });
      setUser(res.data?.user);

      // Store token
      if (res.data?.token) {
        setToken(res.data.token);
      }
      navigate("/");
      window.location.reload();
      setStep("success");
    } catch (err: any) {
      alert(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 LOGOUT

  // ✅ Modal open/close
  const closeModal = () => {
    onClose();
    setTimeout(resetModal, 300);
  };

  if (!isOpen) {
    return;
  }

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <div className="fixed z-40" onClick={closeModal} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-50 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          {step !== "choice" && step !== "success" && (
            <button
              onClick={() => {
                if (step === "otp") setStep("signup");
                else if (step === "profile") setStep("otp");
                else setStep("choice");
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-pink-500 rounded-full">
              <span className="text-white font-bold text-xl">D</span>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === "choice" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Welcome to Dribbble
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Sign up or sign in to continue
              </p>

              <button
                onClick={() => setStep("signup")}
                className="w-full py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors"
              >
                Sign Up
              </button>

              <button
                onClick={() => setStep("signin")}
                className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-pink-500 hover:text-pink-500 transition-colors"
              >
                Sign In
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Google
                </button>
              </div>
            </div>
          )}

          {step === "signup" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create Account
              </h2>
              <p className="text-gray-600 mb-6">Join the Dribbble community</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                      placeholder="Create a password"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSignUp}
                  className="w-full py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors mt-6"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === "signin" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600 mb-6">Sign in to your account</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded text-pink-500 focus:ring-pink-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Remember me
                    </span>
                  </label>
                  <button className="text-sm text-pink-500 hover:text-pink-600">
                    Forgot password?
                  </button>
                </div>

                <button
                  onClick={handleSignIn}
                  className="w-full py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors mt-6"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {step === "otp" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verify Your Email
              </h2>
              <p className="text-gray-600 mb-6">
                We sent a code to {formData.email}
              </p>

              <div className="space-y-6">
                <div className="flex justify-between gap-2">
                  {formData.otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el: any) => (otpRefs.current[index] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-full aspect-square text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                    />
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Did not receive the code?{" "}
                    <button
                      type="button"
                      className="text-pink-500 hover:text-pink-600 font-medium"
                    >
                      Resend
                    </button>
                  </p>
                </div>

                <button
                  onClick={handleOtpVerify}
                  className="w-full py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors"
                >
                  Verify Email
                </button>
              </div>
            </div>
          )}

          {step === "profile" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Complete Your Profile
              </h2>
              <p className="text-gray-600 mb-6">Tell us a bit about yourself</p>

              <div className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    {formData.avatar ? (
                      <img
                        src={URL.createObjectURL(formData.avatar)}
                        alt="avatar preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-pink-400"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-linear-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                        {formData.name
                          ? formData.name.charAt(0).toUpperCase()
                          : "?"}
                      </div>
                    )}

                    {/* Hidden file input + clickable label */}
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 bg-white border-2 border-gray-300 rounded-full p-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-gray-600" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData((prev) => ({ ...prev, avatar: file }));
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none"
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>

                <button
                  onClick={handleProfileComplete}
                  disabled={loading}
                  className={`w-full py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors mt-6 ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Saving..." : "Complete Setup"}
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                You are All Set!
              </h2>
              <p className="text-gray-600 mb-6">
                Welcome to Dribbble, {formData.name || "there"}!
              </p>

              <button
                onClick={closeModal}
                className="px-8 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
