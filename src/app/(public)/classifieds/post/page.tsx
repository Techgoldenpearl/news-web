"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { publicApi, customerApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useSite } from "@/lib/site-context";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { classifiedPostSchema, fieldErrorsFrom } from "@/lib/auth-validation";

const CATEGORIES = [
  { value: "property", label: "Property", labelHi: "संपत्ति" },
  { value: "jobs", label: "Jobs", labelHi: "नौकरी" },
  { value: "business", label: "Business", labelHi: "व्यापार" },
  { value: "services", label: "Services", labelHi: "सेवाएं" },
  { value: "vehicles", label: "Vehicles", labelHi: "वाहन" },
  { value: "buy_sell", label: "Buy/Sell", labelHi: "खरीदें/बेचें" },
  { value: "matrimonial", label: "Matrimonial", labelHi: "वैवाहिक" },
  { value: "education", label: "Education", labelHi: "शिक्षा" },
  { value: "lost_found", label: "Lost & Found", labelHi: "खोया-पाया" },
  { value: "public_notice", label: "Public Notice", labelHi: "सार्वजनिक सूचना" },
];

const emptyForm = {
  category: "property", title: "", titleHindi: "", description: "", descriptionHindi: "",
  price: "", contactName: "", contactPhone: "", contactWhatsapp: "",
  state: "", city: "", area: "", packageType: "basic", images: [] as string[],
};

export default function PostClassifiedPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { isHindi } = useSite();
  const [form, setForm] = useState(emptyForm);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const lang: "hi" | "en" = isHindi ? "hi" : "en";

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    publicApi.states().then((r) => setStates(r.data)).catch(() => {});
    publicApi.classifiedPackages().then((r) => setPackages(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const matched = states.find((s) => s.name === form.state);
    if (matched) {
      publicApi.cities(matched.slug).then((r) => setCities(r.data?.cities || [])).catch(() => {});
    } else {
      setCities([]);
    }
  }, [form.state, states]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

  const normalizeMimeType = (type: string) => (type === "image/jpg" ? "image/jpeg" : type);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(isHindi
        ? "असमर्थित फ़ाइल प्रकार। कृपया JPG, PNG, WebP या GIF अपलोड करें (HEIC समर्थित नहीं है)।"
        : "Unsupported file type. Please upload JPG, PNG, WebP, or GIF (HEIC is not supported).");
      e.target.value = "";
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error(isHindi ? "फ़ाइल बहुत बड़ी है (अधिकतम 8MB)" : "File too large (max 8MB)");
      e.target.value = "";
      return;
    }
    setUploadingPhoto(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await customerApi.uploadClassifiedPhoto(base64, file.name, normalizeMimeType(file.type));
      setForm((prev) => ({ ...prev, images: [...prev.images, res.data.url] }));
    } catch (err: any) {
      toast.error(err.response?.data?.error || (isHindi ? "अपलोड विफल" : "Upload failed"));
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const removePhoto = (url: string) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((i) => i !== url) }));
  };

  const validate = (values: typeof form) => fieldErrorsFrom(classifiedPostSchema(lang).safeParse(values));

  const handleBlur = (field: string) => {
    setTouched((tt) => ({ ...tt, [field]: true }));
    setFieldErrors(validate(form));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate(form);
    setFieldErrors(errors);
    setTouched({
      title: true, price: true, contactName: true, contactPhone: true, contactWhatsapp: true,
    });
    if (Object.keys(errors).length > 0) {
      toast.error(isHindi ? "कृपया फ़ॉर्म में त्रुटियां ठीक करें" : "Please fix the errors in the form");
      return;
    }
    setSubmitting(true);
    try {
      await customerApi.submitClassified(form);
      toast.success(isHindi ? "विज्ञापन समीक्षा के लिए जमा किया गया" : "Ad submitted for review");
      router.push("/classifieds/my-ads");
    } catch (err: any) {
      toast.error(err.response?.data?.error || (isHindi ? "जमा करने में विफल" : "Failed to submit"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isHindi ? "विज्ञापन पोस्ट करें" : "Post an Ad"}</h1>
        <Link href="/classifieds/my-ads" className="text-sm text-brand hover:underline">{isHindi ? "मेरे विज्ञापन" : "My Ads"}</Link>
      </div>

      <form onSubmit={submit} className="bg-panel rounded-lg border-line border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{isHindi ? "श्रेणी *" : "Category *"}</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg">
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{isHindi ? c.labelHi : c.label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "शीर्षक *" : "Title *"}</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              onBlur={() => handleBlur("title")}
              className={`w-full px-3 py-2 border rounded-lg ${touched.title && fieldErrors.title ? "border-red-400" : ""}`} required />
            {touched.title && fieldErrors.title && <p className="text-red-500 text-xs mt-1">{fieldErrors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "शीर्षक (हिंदी)" : "Title (Hindi)"}</label>
            <input value={form.titleHindi} onChange={(e) => setForm({ ...form, titleHindi: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{isHindi ? "फ़ोटो" : "Photos"}</label>
          <div className="flex flex-wrap gap-3">
            {form.images.map((url) => (
              <div key={url} className="relative w-24 h-24">
                <img src={url} alt="" className="w-24 h-24 rounded-lg object-cover border" />
                <button type="button" onClick={() => removePhoto(url)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600">
                  <X size={12} />
                </button>
              </div>
            ))}
            {form.images.length < 5 && (
              uploadingPhoto ? (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 w-24 h-24">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-200 border-t-blue-600" />
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg w-24 h-24 cursor-pointer hover:border-brand hover:bg-brand/5 transition">
                  <Upload size={18} className="text-gray-400 mb-1" />
                  <span className="text-[10px] text-gray-500 text-center px-1">{isHindi ? "अपलोड करें" : "Upload"}</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handlePhotoUpload} className="hidden" />
                </label>
              )
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">{isHindi ? "अधिकतम 5 फ़ोटो, प्रत्येक 8MB तक" : "Up to 5 photos, max 8MB each"}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{isHindi ? "विवरण" : "Description"}</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4} className="w-full px-3 py-2 border rounded-lg" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{isHindi ? "कीमत" : "Price"}</label>
          <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
            onBlur={() => handleBlur("price")}
            className={`w-full px-3 py-2 border rounded-lg ${touched.price && fieldErrors.price ? "border-red-400" : ""}`} placeholder="₹" />
          {touched.price && fieldErrors.price && <p className="text-red-500 text-xs mt-1">{fieldErrors.price}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "राज्य" : "State"}</label>
            <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value, city: "" })}
              className="w-full px-3 py-2 border rounded-lg">
              <option value="">{isHindi ? "चुनें" : "Select"}</option>
              {states.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "शहर" : "City"}</label>
            <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" disabled={!form.state}>
              <option value="">{isHindi ? "चुनें" : "Select"}</option>
              {cities.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "क्षेत्र" : "Area"}</label>
            <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "संपर्क नाम" : "Contact Name"}</label>
            <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              onBlur={() => handleBlur("contactName")}
              className={`w-full px-3 py-2 border rounded-lg ${touched.contactName && fieldErrors.contactName ? "border-red-400" : ""}`} />
            {touched.contactName && fieldErrors.contactName && <p className="text-red-500 text-xs mt-1">{fieldErrors.contactName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "फ़ोन" : "Phone"}</label>
            <input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              onBlur={() => handleBlur("contactPhone")}
              className={`w-full px-3 py-2 border rounded-lg ${touched.contactPhone && fieldErrors.contactPhone ? "border-red-400" : ""}`} placeholder="10-digit number" />
            {touched.contactPhone && fieldErrors.contactPhone && <p className="text-red-500 text-xs mt-1">{fieldErrors.contactPhone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp</label>
            <input value={form.contactWhatsapp} onChange={(e) => setForm({ ...form, contactWhatsapp: e.target.value })}
              onBlur={() => handleBlur("contactWhatsapp")}
              className={`w-full px-3 py-2 border rounded-lg ${touched.contactWhatsapp && fieldErrors.contactWhatsapp ? "border-red-400" : ""}`} />
            {touched.contactWhatsapp && fieldErrors.contactWhatsapp && <p className="text-red-500 text-xs mt-1">{fieldErrors.contactWhatsapp}</p>}
          </div>
        </div>
        <p className="text-xs text-gray-400 -mt-2">{isHindi ? "* फ़ोन या WhatsApp में से कम से कम एक आवश्यक है" : "* At least one of Phone or WhatsApp is required"}</p>

        {packages.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "पैकेज" : "Package"}</label>
            <select value={form.packageType} onChange={(e) => setForm({ ...form, packageType: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg">
              {packages.map((p: any) => (
                <option key={p.id} value={p.slug || p.type}>{p.name} {p.price ? `– ₹${p.price}` : ""}</option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" disabled={submitting}
          className="w-full px-6 py-2.5 bg-brand text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-medium">
          {submitting ? (isHindi ? "जमा हो रहा है..." : "Submitting...") : (isHindi ? "जमा करें" : "Submit for Review")}
        </button>
      </form>
    </div>
  );
}
