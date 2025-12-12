import React, { useState } from "react";
import type { RegisterData } from "../../types/auth";
import { FormField } from "../ui/form";

interface RegisterStepProps {
  onSubmit: (data: RegisterData) => void;
  onGoogleSignIn: () => void;
  loading: boolean;
   googleLoading?: boolean;
  onSwitchToLogin: () => void;
}

export const RegisterStep: React.FC<RegisterStepProps> = ({
  onSubmit,
  onGoogleSignIn,
  loading,
  googleLoading = false,
  onSwitchToLogin,
}) => {
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Full Name"
        type="text"
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        placeholder="Enter your full name"
      />

      <FormField
        label="Email Address"
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
        placeholder="Enter your email"
      />

      <FormField
        label="Password"
        type="password"
        id="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
        placeholder="Enter your password"
      />

      <FormField
        label=" Confirm Password"
        type="password"
        id="confirmPassword"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        placeholder="Confirm your password"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full  bg-linear-to-r from-purple-600 to-pink-600 text-white  hover:from-purple-700 hover:to-pink-700 py-3 px-4 rounded-lg hover:bg-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>

       {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 text-gray-200 bg-slate-800">Or continue with</span>
        </div>
      </div>

      {/* Google Sign In Button */}
      <button
        type="button"
        onClick={onGoogleSignIn}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 hover:bg-gray-100 border border-gray-300 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {googleLoading ? (
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            <span>Signing in...</span>
          </div>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Sign in with Google</span>
          </>
        )}
      </button>

      <div className="text-center">
        <p className="text-gray-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </form>
  );
};
