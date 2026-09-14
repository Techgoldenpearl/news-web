"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import PasswordInput from "@/components/PasswordInput";

type Step = "email" | "otp" | "password" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setInfo("If that email is registered, a 6-digit code has been sent to it.");
      setStep("otp");
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(email, otp);
      setResetToken(res.data.resetToken);
      setInfo("");
      setStep("password");
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(resetToken, newPassword);
      setStep("done");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-1">Forgot Password</h1>
        <p className="text-gray-500 text-center mb-6">
          {step === "email" && "Enter your email to receive a verification code"}
          {step === "otp" && "Enter the 6-digit code we emailed you"}
          {step === "password" && "Choose a new password"}
          {step === "done" && "Password updated"}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}
        {info && step === "otp" && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl mb-4 text-sm">
            {info}
          </div>
        )}

        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-brand"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? "Sending..." : "Send Code"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              maxLength={6}
              className="w-full px-4 py-3 border rounded-xl text-center tracking-[0.5em] text-lg focus:ring-2 focus:ring-orange-300 focus:border-brand"
            />
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-brand text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-sm text-gray-500 hover:text-brand"
            >
              Use a different email
            </button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <PasswordInput
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-brand"
            />
            <PasswordInput
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-brand"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? "Saving..." : "Reset Password"}
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-sm">
              Your password has been reset. You can now sign in with your new password.
            </div>
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-brand text-white py-3 rounded-xl font-medium hover:opacity-90 transition"
            >
              Go to Sign In
            </button>
          </div>
        )}

        {step !== "done" && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Remembered your password? <Link href="/login" className="text-brand font-medium">Sign In</Link>
          </p>
        )}
      </div>
    </div>
  );
}
