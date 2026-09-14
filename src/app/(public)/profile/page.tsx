"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useSite } from "@/lib/site-context";
import { authApi } from "@/lib/api";
import { profileSchema, changePasswordSchema, fieldErrorsFrom } from "@/lib/auth-validation";
import { User, Bookmark, Clock, CreditCard, LogOut, Camera, Loader2, KeyRound, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-7 w-40 bg-gray-200 rounded mb-6" />
      <div className="bg-white rounded-2xl border p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-44 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-11 bg-gray-100 rounded-xl" />
          <div className="h-11 bg-gray-100 rounded-xl" />
          <div className="h-20 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading, logout, refreshUser } = useAuth();
  const { isHindi } = useSite();
  const t = (en: string, hi: string) => (isHindi ? hi : en);

  const toFormValues = (u: typeof user) => ({ name: u?.name || "", phone: u?.phone || "", bio: u?.bio || "" });

  const [loadedUserId, setLoadedUserId] = useState<number | null>(null);
  const [form, setForm] = useState(() => toFormValues(user));
  const [initialForm, setInitialForm] = useState(() => toFormValues(user));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  if (user && user.id !== loadedUserId) {
    const next = toFormValues(user);
    setForm(next);
    setInitialForm(next);
    setLoadedUserId(user.id);
  }

  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwTouched, setPwTouched] = useState<Record<string, boolean>>({});
  const [pwSaving, setPwSaving] = useState(false);

  if (loading) return <ProfileSkeleton />;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <User size={48} className="text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">{t("Your Profile", "आपकी प्रोफ़ाइल")}</h1>
        <p className="text-gray-500 mb-4">{t("Login to manage your profile", "अपनी प्रोफ़ाइल प्रबंधित करने के लिए लॉगिन करें")}</p>
        <Link href="/login" className="inline-block bg-brand text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition">{t("Login", "लॉगिन")}</Link>
      </div>
    );
  }

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  const validate = (values: typeof form) => fieldErrorsFrom(profileSchema.safeParse(values));

  const handleChange = (field: keyof typeof form, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);
    if (touched[field]) setFieldErrors(validate(next));
  };

  const handleBlur = (field: keyof typeof form) => {
    setTouched((tt) => ({ ...tt, [field]: true }));
    setFieldErrors(validate(form));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, phone: true, bio: true });
    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      await authApi.updateProfile(form);
      setInitialForm(form);
      await refreshUser?.();
      toast.success(t("Profile updated", "प्रोफ़ाइल अपडेट की गई"));
    } catch (err: any) {
      toast.error(err.response?.data?.error || t("Failed to update profile", "प्रोफ़ाइल अपडेट करने में विफल"));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("Please select an image file", "कृपया एक इमेज फ़ाइल चुनें"));
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error(t("Image must be under 5MB", "इमेज 5MB से कम होनी चाहिए"));
      return;
    }

    setAvatarUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await authApi.uploadAvatar(base64, file.name, file.type);
      await refreshUser?.();
      toast.success(t("Profile photo updated", "प्रोफ़ाइल फ़ोटो अपडेट की गई"));
    } catch (err: any) {
      toast.error(err.response?.data?.error || t("Failed to upload photo", "फ़ोटो अपलोड करने में विफल"));
    } finally {
      setAvatarUploading(false);
    }
  };

  const validatePw = (values: typeof pwForm) => fieldErrorsFrom(changePasswordSchema.safeParse(values));

  const handlePwChange = (field: keyof typeof pwForm, value: string) => {
    const next = { ...pwForm, [field]: value };
    setPwForm(next);
    if (pwTouched[field]) setPwErrors(validatePw(next));
  };

  const handlePwBlur = (field: keyof typeof pwForm) => {
    setPwTouched((tt) => ({ ...tt, [field]: true }));
    setPwErrors(validatePw(pwForm));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwTouched({ currentPassword: true, newPassword: true, confirmNewPassword: true });
    const errors = validatePw(pwForm);
    setPwErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPwSaving(true);
    try {
      await authApi.changePassword(pwForm.currentPassword, pwForm.newPassword);
      toast.success(t("Password changed successfully", "पासवर्ड सफलतापूर्वक बदला गया"));
      setPwForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      setPwTouched({});
      setPwErrors({});
      setShowPasswordSection(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || t("Failed to change password", "पासवर्ड बदलने में विफल"));
    } finally {
      setPwSaving(false);
    }
  };

  const fieldClass = (field: string) =>
    `w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-brand transition ${
      touched[field] && fieldErrors[field] ? "border-red-400" : "border-gray-200"
    }`;

  const pwFieldClass = (field: string) =>
    `w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-brand transition ${
      pwTouched[field] && pwErrors[field] ? "border-red-400" : "border-gray-200"
    }`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t("My Profile", "मेरी प्रोफ़ाइल")}</h1>

      <div className="bg-white rounded-2xl border p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={avatarUploading}
            className="relative w-20 h-20 rounded-full group shrink-0 disabled:cursor-wait"
            aria-label={t("Change profile photo", "प्रोफ़ाइल फ़ोटो बदलें")}
          >
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 bg-brand-tint rounded-full flex items-center justify-center text-3xl font-bold text-brand">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
              {avatarUploading ? (
                <Loader2 size={20} className="text-white animate-spin" />
              ) : (
                <Camera size={18} className="text-white opacity-0 group-hover:opacity-100 transition" />
              )}
            </div>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("Name", "नाम")}</label>
            <input value={form.name} onChange={(e) => handleChange("name", e.target.value)} onBlur={() => handleBlur("name")}
              className={fieldClass("name")} />
            {touched.name && fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("Phone", "फ़ोन")}</label>
            <input value={form.phone} inputMode="numeric"
              onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              onBlur={() => handleBlur("phone")}
              placeholder={t("10-digit phone number", "10 अंकों का फ़ोन नंबर")} className={fieldClass("phone")} />
            {touched.phone && fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("Bio", "परिचय")}</label>
            <textarea value={form.bio} onChange={(e) => handleChange("bio", e.target.value)} onBlur={() => handleBlur("bio")}
              rows={3} maxLength={2000} className={fieldClass("bio")} />
            <div className="flex justify-between mt-1">
              {touched.bio && fieldErrors.bio ? (
                <p className="text-red-500 text-xs">{fieldErrors.bio}</p>
              ) : <span />}
              <p className="text-gray-400 text-xs">{form.bio.length}/2000</p>
            </div>
          </div>
          <button type="submit" disabled={saving || !isDirty}
            className="bg-brand text-white px-6 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition inline-flex items-center gap-2">
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? t("Saving...", "सहेजा जा रहा है...") : t("Save Changes", "बदलाव सहेजें")}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border mb-6 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowPasswordSection((s) => !s)}
          className="w-full flex items-center justify-between p-6 text-left"
        >
          <span className="flex items-center gap-3 font-medium">
            <span className="p-2 bg-gray-100 rounded-lg"><KeyRound size={18} className="text-gray-600" /></span>
            {t("Change Password", "पासवर्ड बदलें")}
          </span>
          <ChevronDown size={18} className={`text-gray-400 transition-transform ${showPasswordSection ? "rotate-180" : ""}`} />
        </button>
        {showPasswordSection && (
          <form onSubmit={handleChangePassword} noValidate className="px-6 pb-6 space-y-4 border-t pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("Current Password", "वर्तमान पासवर्ड")}</label>
              <PasswordInput value={pwForm.currentPassword}
                onChange={(e) => handlePwChange("currentPassword", e.target.value)} onBlur={() => handlePwBlur("currentPassword")}
                className={pwFieldClass("currentPassword")} />
              {pwTouched.currentPassword && pwErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{pwErrors.currentPassword}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("New Password", "नया पासवर्ड")}</label>
              <PasswordInput value={pwForm.newPassword}
                onChange={(e) => handlePwChange("newPassword", e.target.value)} onBlur={() => handlePwBlur("newPassword")}
                className={pwFieldClass("newPassword")} />
              {pwTouched.newPassword && pwErrors.newPassword && <p className="text-red-500 text-xs mt-1">{pwErrors.newPassword}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("Confirm New Password", "नए पासवर्ड की पुष्टि करें")}</label>
              <PasswordInput value={pwForm.confirmNewPassword}
                onChange={(e) => handlePwChange("confirmNewPassword", e.target.value)} onBlur={() => handlePwBlur("confirmNewPassword")}
                className={pwFieldClass("confirmNewPassword")} />
              {pwTouched.confirmNewPassword && pwErrors.confirmNewPassword && <p className="text-red-500 text-xs mt-1">{pwErrors.confirmNewPassword}</p>}
            </div>
            <button type="submit" disabled={pwSaving}
              className="bg-brand text-white px-6 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition inline-flex items-center gap-2">
              {pwSaving && <Loader2 size={16} className="animate-spin" />}
              {pwSaving ? t("Updating...", "अपडेट हो रहा है...") : t("Update Password", "पासवर्ड अपडेट करें")}
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link href="/bookmarks" className="flex items-center gap-3 bg-white rounded-xl border p-4 hover:shadow-md hover:border-brand/30 transition">
          <div className="p-2.5 bg-blue-100 rounded-lg"><Bookmark size={18} className="text-blue-600" /></div>
          <span className="font-medium">{t("Bookmarks", "बुकमार्क")}</span>
        </Link>
        <Link href="/history" className="flex items-center gap-3 bg-white rounded-xl border p-4 hover:shadow-md hover:border-brand/30 transition">
          <div className="p-2.5 bg-purple-100 rounded-lg"><Clock size={18} className="text-purple-600" /></div>
          <span className="font-medium">{t("History", "इतिहास")}</span>
        </Link>
        <Link href="/membership" className="flex items-center gap-3 bg-white rounded-xl border p-4 hover:shadow-md hover:border-brand/30 transition">
          <div className="p-2.5 bg-amber-100 rounded-lg"><CreditCard size={18} className="text-amber-600" /></div>
          <span className="font-medium">{t("Membership", "सदस्यता")}</span>
        </Link>
      </div>

      <button onClick={logout}
        className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium">
        <LogOut size={18} /> {t("Logout", "लॉग आउट")}
      </button>
    </div>
  );
}
