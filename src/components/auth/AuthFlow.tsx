import React, { useState } from "react";
import type {
  CompleteProfileData,
  LoginData,
  RegisterData,
  VerifyOtpData,
} from "../../types/auth";
import { RegisterStep } from "./RegisterStep";
import { VerifyOtpStep } from "./VerifyOtpStep";
import { CompleteProfileStep } from "./CompleteProfileStep";
import { LoginStep } from "./LoginStep";
import {
  completeProfile,
  googleLogin,
  loginUser,
  registerUser,
  verifyOtp,
} from "../../api/auth";
import { setToken } from "../../utils/cookieHelper";
import { setUser } from "../../utils/userStorage";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";

type AuthStep = "register" | "verify-otp" | "complete-profile" | "login";

export const AuthFlow: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<AuthStep>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<
    Partial<RegisterData & VerifyOtpData & CompleteProfileData>
  >({});

  console.log("userData", userData);
  // 📝 Register
  const handleRegister = async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    try {
      await registerUser(data);
      setUserData((prev) => ({ ...prev, ...data }));
      setCurrentStep("verify-otp");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Verify OTP
  const handleVerifyOtp = async (data: VerifyOtpData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await verifyOtp({
        ...data,
        email: userData.email!,
      });
      setToken(result.data.token);
      setCurrentStep("complete-profile");
    } catch (err: any) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Complete Profile
  const handleCompleteProfile = async (data: CompleteProfileData) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("email", userData.email!);
      formData.append("username", data.username);
      formData.append("bio", data.bio);
      formData.append("bannerColor", data.bannerColor);

      // ✅ Append avatar file if provided
      if (data.avatar) {
        formData.append("avatar", data.avatar);
      }

      const result = await completeProfile(formData);
      setUser(result?.data?.user);
      console.log("result", result);
      console.log("formData", formData);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Profile completion failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔑 Login
  const handleLogin = async (data: LoginData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginUser(data);
      setToken(result.data.token);
      setUser(result?.data?.user);
      window.location.href = "/";
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  const switchToLogin = () => {
    setCurrentStep("login");
    setError(null);
  };

  const switchToRegister = () => {
    setCurrentStep("register");
    setError(null);
  };

  // Google login handler
  const googleSignin = useGoogleLogin({
    onSuccess: async (tokenResponse: any) => {
      try {
        const data = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse?.access_token}` },
          }
        );
        const userInfo = data?.data;
        if (userInfo) {
          const data = {
            email: userInfo.email,
            name: userInfo.name,
            avatar: userInfo.picture,
          };
          const response = await googleLogin(data);

          const userPayload = response.data;
          setToken(userPayload?.token);
          setUser(userPayload?.user);

          navigate("/");
        }
      } catch (error) {
        console.error("Google login failed:", error);
      }
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 ">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl ">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-300 mb-2">
              {currentStep === "register" && "Create Account"}
              {currentStep === "verify-otp" && "Verify Email"}
              {currentStep === "complete-profile" && "Complete Profile"}
              {currentStep === "login" && "Welcome Back"}
            </h1>
            <p className="text-gray-400">
              {currentStep === "register" && "Sign up to get started"}
              {currentStep === "verify-otp" &&
                "Enter the OTP sent to your email"}
              {currentStep === "complete-profile" &&
                "Tell us more about yourself"}
              {currentStep === "login" && "Sign in to your account"}
            </p>
          </div>

          {/* Progress Steps */}
          {currentStep !== "login" && (
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-4">
                {(
                  ["register", "verify-otp", "complete-profile"] as AuthStep[]
                ).map((step, index) => (
                  <React.Fragment key={step}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep === step
                          ? "bg-pink-600 text-white"
                          : step === "register" ||
                            (step === "verify-otp" &&
                              currentStep === "complete-profile")
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    {index < 2 && (
                      <div
                        className={`w-12 h-1 ${
                          (step === "register" &&
                            currentStep === "verify-otp") ||
                          (step === "verify-otp" &&
                            currentStep === "complete-profile")
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Step Components */}
          {currentStep === "register" && (
            <RegisterStep
              onGoogleSignIn={googleSignin}
              onSubmit={handleRegister}
              loading={loading}
              onSwitchToLogin={switchToLogin}
            />
          )}

          {currentStep === "verify-otp" && (
            <VerifyOtpStep
              onSubmit={handleVerifyOtp}
              loading={loading}
              email={userData.email!}
              onResendOtp={() => {
                // Implement resend OTP logic
              }}
            />
          )}

          {currentStep === "complete-profile" && (
            <CompleteProfileStep
              onSubmit={handleCompleteProfile}
              loading={loading}
            />
          )}

          {currentStep === "login" && (
            <LoginStep
              onGoogleSignIn={googleSignin}
              onSubmit={handleLogin}
              loading={loading}
              onSwitchToRegister={switchToRegister}
            />
          )}
        </div>
      </div>
    </div>
  );
};
