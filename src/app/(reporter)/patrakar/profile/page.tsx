"use client";

import { useState, useRef } from "react";
import { ReporterGate } from "@/components/reporter/ReporterGate";
import { useReporterAuth } from "@/lib/reporter-auth-context";
import { reporterAuthApi } from "@/lib/reporter-api";
import { toast } from "sonner";
import PasswordInput from "@/components/PasswordInput";
import { Camera, Loader2, KeyRound, ChevronDown, BadgeCheck } from "lucide-react";
import { z } from "zod";
import { fieldErrorsFrom } from "@/lib/auth-validation";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const profileSchema = z.object({
  name: z.string().min(2, "नाम कम से कम 2 अक्षर का होना चाहिए").max(200),
  nameHindi: z.string().max(200).optional(),
  phone: z.string().optional().refine((v) => !v || /^[0-9]{10}$/.test(v), "फ़ोन नंबर बिल्कुल 10 अंकों का होना चाहिए"),
  designation: z.string().max(100).optional(),
  beat: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  bio: z.string().max(2000, "परिचय 2000 अक्षर से कम होना चाहिए").optional(),
  twitterHandle: z.string().max(100).optional(),
  facebookUrl: z.string().optional().refine((v) => !v || /^https?:\/\/.+/.test(v), "मान्य URL दर्ज करें"),
});

const pwSchema = z
  .object({
    currentPassword: z.string().min(1, "वर्तमान पासवर्ड आवश्यक है"),
    newPassword: z
      .string()
      .min(8, "पासवर्ड कम से कम 8 अक्षर का होना चाहिए")
      .refine((v) => /[a-z]/.test(v) && /[A-Z]/.test(v) && /[0-9]/.test(v), "पासवर्ड में बड़े, छोटे अक्षर और एक अंक होना चाहिए"),
    confirmNewPassword: z.string().min(1, "नए पासवर्ड की पुष्टि करें"),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, { message: "पासवर्ड मेल नहीं खाते", path: ["confirmNewPassword"] })
  .refine((d) => d.currentPassword !== d.newPassword, { message: "नया पासवर्ड वर्तमान पासवर्ड से अलग होना चाहिए", path: ["newPassword"] });

const inp = (hasError: boolean) =>
  `w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-200 focus:border-brand outline-none transition ${hasError ? "border-red-400" : "border-gray-200"}`;

function ProfileSkeleton() {
  return (
    <div className="max-w-2xl space-y-6 animate-pulse">
      <div className="h-7 w-40 bg-gray-200 rounded" />
      <div className="bg-white rounded-xl border p-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-20 h-20 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-5 w-36 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-10 bg-gray-100 rounded-lg" />
          <div className="h-10 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function ProfileForm() {
  const { reporter, refresh, loading: authLoading } = useReporterAuth();

  const toValues = (r: typeof reporter) => ({
    name: r?.name || "", nameHindi: r?.nameHindi || "", phone: r?.phone || "", designation: r?.designation || "",
    beat: r?.beat || "", city: r?.city || "", state: r?.state || "",
    bio: r?.bio || "", twitterHandle: r?.twitterHandle || "", facebookUrl: r?.facebookUrl || "",
  });

  const [loadedId, setLoadedId] = useState<number | null>(null);
  const [form, setForm] = useState(() => toValues(reporter));
  const [initialForm, setInitialForm] = useState(() => toValues(reporter));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  if (reporter && reporter.id !== loadedId) {
    const next = toValues(reporter);
    setForm(next);
    setInitialForm(next);
    setLoadedId(reporter.id);
  }

  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showPwSection, setShowPwSection] = useState(false);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwTouched, setPwTouched] = useState<Record<string, boolean>>({});
  const [pwSaving, setPwSaving] = useState(false);

  if (authLoading) return <ProfileSkeleton />;

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  const validate = (values: typeof form) => fieldErrorsFrom(profileSchema.safeParse(values));

  const handleChange = (field: keyof typeof form, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);
    if (touched[field]) setFieldErrors(validate(next));
  };

  const handlePhoneChange = (value: string) => handleChange("phone", value.replace(/\D/g, "").slice(0, 10));

  const handleBlur = (field: keyof typeof form) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setFieldErrors(validate(form));
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, nameHindi: true, phone: true, designation: true, beat: true, city: true, state: true, bio: true, twitterHandle: true, facebookUrl: true });
    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      await reporterAuthApi.updateProfile(form);
      setInitialForm(form);
      await refresh();
      toast.success("प्रोफ़ाइल अपडेट हुई");
    } catch { toast.error("अपडेट विफल"); }
    finally { setSaving(false); }
  };

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) { toast.error("कृपया एक इमेज फ़ाइल चुनें"); return; }
    if (file.size > MAX_PHOTO_BYTES) { toast.error("इमेज 5MB से कम होनी चाहिए"); return; }

    setPhotoUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await reporterAuthApi.uploadPhoto(base64, file.name, file.type);
      await refresh();
      toast.success("फ़ोटो अपडेट हुई");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "फ़ोटो अपलोड करने में विफल");
    } finally { setPhotoUploading(false); }
  };

  const validatePw = (values: typeof pw) => fieldErrorsFrom(pwSchema.safeParse(values));

  const handlePwChange = (field: keyof typeof pw, value: string) => {
    const next = { ...pw, [field]: value };
    setPw(next);
    if (pwTouched[field]) setPwErrors(validatePw(next));
  };

  const handlePwBlur = (field: keyof typeof pw) => {
    setPwTouched((t) => ({ ...t, [field]: true }));
    setPwErrors(validatePw(pw));
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwTouched({ currentPassword: true, newPassword: true, confirmNewPassword: true });
    const errors = validatePw(pw);
    setPwErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPwSaving(true);
    try {
      await reporterAuthApi.changePassword(pw.currentPassword, pw.newPassword);
      toast.success("पासवर्ड बदला गया");
      setPw({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      setPwTouched({});
      setPwErrors({});
      setShowPwSection(false);
    } catch (err: any) { toast.error(err.response?.data?.error || "पासवर्ड बदलने में विफल"); }
    finally { setPwSaving(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">प्रोफ़ाइल सेटिंग्स</h1>

      <form onSubmit={saveProfile} className="bg-white rounded-xl border p-5 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b">
          <button
            type="button"
            onClick={handlePhotoClick}
            disabled={photoUploading}
            className="relative w-20 h-20 rounded-full group shrink-0 disabled:cursor-wait"
            aria-label="प्रोफ़ाइल फ़ोटो बदलें"
          >
            {reporter?.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={reporter.photoUrl} alt={reporter.name} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 bg-brand-tint rounded-full flex items-center justify-center text-2xl font-bold text-brand">
                {reporter?.name?.[0]?.toUpperCase() || "P"}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
              {photoUploading ? <Loader2 size={20} className="text-white animate-spin" /> : <Camera size={18} className="text-white opacity-0 group-hover:opacity-100 transition" />}
            </div>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          <div>
            <h2 className="font-bold text-gray-900">{reporter?.name}</h2>
            <p className="text-sm text-gray-500">{reporter?.email}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <BadgeCheck size={14} className="text-brand" />
              <span className="text-xs font-mono text-gray-500">{reporter?.employeeId}</span>
            </div>
          </div>
        </div>

        <h3 className="font-semibold text-gray-800 text-sm">सामान्य जानकारी</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">नाम</label>
            <input value={form.name} onChange={(e) => handleChange("name", e.target.value)} onBlur={() => handleBlur("name")} className={inp(!!(touched.name && fieldErrors.name))} />
            {touched.name && fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">नाम (हिंदी में, वैकल्पिक)</label>
            <input value={form.nameHindi} onChange={(e) => handleChange("nameHindi", e.target.value)} onBlur={() => handleBlur("nameHindi")} className={inp(!!(touched.nameHindi && fieldErrors.nameHindi))} />
            {touched.nameHindi && fieldErrors.nameHindi && <p className="text-red-500 text-xs mt-1">{fieldErrors.nameHindi}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">फ़ोन</label>
            <input value={form.phone} inputMode="numeric" placeholder="10 अंकों का नंबर"
              onChange={(e) => handlePhoneChange(e.target.value)} onBlur={() => handleBlur("phone")}
              className={inp(!!(touched.phone && fieldErrors.phone))} />
            {touched.phone && fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">पदनाम</label>
            <input value={form.designation} onChange={(e) => handleChange("designation", e.target.value)} onBlur={() => handleBlur("designation")} className={inp(!!(touched.designation && fieldErrors.designation))} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">बीट</label>
            <input value={form.beat} onChange={(e) => handleChange("beat", e.target.value)} onBlur={() => handleBlur("beat")} className={inp(!!(touched.beat && fieldErrors.beat))} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">शहर</label>
            <input value={form.city} onChange={(e) => handleChange("city", e.target.value)} onBlur={() => handleBlur("city")} className={inp(!!(touched.city && fieldErrors.city))} />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">राज्य</label>
          <input value={form.state} onChange={(e) => handleChange("state", e.target.value)} onBlur={() => handleBlur("state")} className={inp(!!(touched.state && fieldErrors.state))} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">परिचय</label>
          <textarea value={form.bio} onChange={(e) => handleChange("bio", e.target.value)} onBlur={() => handleBlur("bio")} rows={3} maxLength={2000}
            className={`${inp(!!(touched.bio && fieldErrors.bio))} resize-none`} />
          <div className="flex justify-between mt-1">
            {touched.bio && fieldErrors.bio ? <p className="text-red-500 text-xs">{fieldErrors.bio}</p> : <span />}
            <p className="text-gray-400 text-xs">{form.bio.length}/2000</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Twitter</label>
            <input value={form.twitterHandle} onChange={(e) => handleChange("twitterHandle", e.target.value)} onBlur={() => handleBlur("twitterHandle")} className={inp(!!(touched.twitterHandle && fieldErrors.twitterHandle))} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Facebook URL</label>
            <input value={form.facebookUrl} onChange={(e) => handleChange("facebookUrl", e.target.value)} onBlur={() => handleBlur("facebookUrl")} className={inp(!!(touched.facebookUrl && fieldErrors.facebookUrl))} />
            {touched.facebookUrl && fieldErrors.facebookUrl && <p className="text-red-500 text-xs mt-1">{fieldErrors.facebookUrl}</p>}
          </div>
        </div>
        <button type="submit" disabled={saving || !isDirty}
          className="bg-brand text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition inline-flex items-center gap-2">
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? "सहेजा जा रहा है..." : "सहेजें"}
        </button>
      </form>

      <div className="bg-white rounded-xl border overflow-hidden">
        <button type="button" onClick={() => setShowPwSection((s) => !s)} className="w-full flex items-center justify-between p-5 text-left">
          <span className="flex items-center gap-3 font-semibold text-gray-800 text-sm">
            <span className="p-2 bg-gray-100 rounded-lg"><KeyRound size={16} className="text-gray-600" /></span>
            पासवर्ड बदलें
          </span>
          <ChevronDown size={18} className={`text-gray-400 transition-transform ${showPwSection ? "rotate-180" : ""}`} />
        </button>
        {showPwSection && (
          <form onSubmit={changePassword} className="px-5 pb-5 space-y-4 border-t pt-4">
            <div>
              <PasswordInput placeholder="वर्तमान पासवर्ड" value={pw.currentPassword}
                onChange={(e) => handlePwChange("currentPassword", e.target.value)} onBlur={() => handlePwBlur("currentPassword")}
                className={inp(!!(pwTouched.currentPassword && pwErrors.currentPassword))} />
              {pwTouched.currentPassword && pwErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{pwErrors.currentPassword}</p>}
            </div>
            <div>
              <PasswordInput placeholder="नया पासवर्ड" value={pw.newPassword}
                onChange={(e) => handlePwChange("newPassword", e.target.value)} onBlur={() => handlePwBlur("newPassword")}
                className={inp(!!(pwTouched.newPassword && pwErrors.newPassword))} />
              {pwTouched.newPassword && pwErrors.newPassword && <p className="text-red-500 text-xs mt-1">{pwErrors.newPassword}</p>}
            </div>
            <div>
              <PasswordInput placeholder="नए पासवर्ड की पुष्टि करें" value={pw.confirmNewPassword}
                onChange={(e) => handlePwChange("confirmNewPassword", e.target.value)} onBlur={() => handlePwBlur("confirmNewPassword")}
                className={inp(!!(pwTouched.confirmNewPassword && pwErrors.confirmNewPassword))} />
              {pwTouched.confirmNewPassword && pwErrors.confirmNewPassword && <p className="text-red-500 text-xs mt-1">{pwErrors.confirmNewPassword}</p>}
            </div>
            <button type="submit" disabled={pwSaving} className="bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-900 disabled:opacity-50 transition inline-flex items-center gap-2">
              {pwSaving && <Loader2 size={16} className="animate-spin" />}
              {pwSaving ? "बदला जा रहा है..." : "पासवर्ड बदलें"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ReporterGate>
      <ProfileForm />
    </ReporterGate>
  );
}
