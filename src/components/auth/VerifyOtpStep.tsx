import React, { useState, useRef, useEffect } from 'react';
import type { VerifyOtpData } from '../../types/auth';

interface VerifyOtpStepProps {
  onSubmit: (data: VerifyOtpData) => void;
  loading: boolean;
  email: string;
  onResendOtp: () => void;
}

export const VerifyOtpStep: React.FC<VerifyOtpStepProps> = ({
  onSubmit,
  loading,
  email,
  onResendOtp,
}) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const OTP_LENGTH = 6;

  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0]?.focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

   const handlePaste = (e:any) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text");
    const digits = pasteData.replace(/\D/g, "").slice(0, OTP_LENGTH).split("");

    if (!digits.length) return;

    const newOtp = [...otp];
    digits.forEach((digit:any, i:any) => {
      newOtp[i] = digit;
    });

    setOtp(newOtp);

    // move focus to last filled input
    const nextIndex = digits.length >= OTP_LENGTH ? OTP_LENGTH - 1 : digits.length;
    inputsRef.current[nextIndex]?.focus();

    // auto submit if full
    if (digits.length === OTP_LENGTH) {
      handleSubmit(newOtp.join(""));
    }
  };

  const handleSubmit = (otpValue?: string) => {
    const otpString = otpValue || otp.join('');
    if (otpString.length === 6) {
      onSubmit({ email, otp: otpString });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-400 mb-4">
          We've sent a 6-digit verification code to:
          <br />
          <strong>{email}</strong>
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-6"
      >
        <div className="flex justify-center space-x-2" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el:any) => (inputsRef.current[index] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-white text-center text-xl font-semibold border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || otp.some(digit => digit === '')}
          className="w-full  bg-linear-to-r from-purple-600 to-pink-600 text-white  hover:from-purple-700 hover:to-pink-700  py-3 px-4 rounded-lg hover:bg-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>

      <div className="text-center">
        <p className="text-gray-400">
          Didn't receive the code?{' '}
          <button
            type="button"
            onClick={onResendOtp}
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  );
};