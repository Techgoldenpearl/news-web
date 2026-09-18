import { z } from "zod";

const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128)
  .refine((v) => /[a-z]/.test(v), "Password must include a lowercase letter")
  .refine((v) => /[A-Z]/.test(v), "Password must include an uppercase letter")
  .refine((v) => /[0-9]/.test(v), "Password must include a number");

const phoneField = z
  .string()
  .optional()
  .refine((v) => !v || /^[0-9]{10}$/.test(v), "Phone number must be exactly 10 digits");

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(200),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    phone: phoneField,
    password: strongPassword,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  phone: phoneField,
  bio: z.string().max(2000, "Bio must be under 2000 characters").optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: strongPassword,
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

// ─── Bilingual portal forms (reporter / advertiser) ──────────────────────────

const portalMessages = {
  hi: {
    required: (field: string) => `${field} आवश्यक है`,
    email: "मान्य ईमेल पता दर्ज करें",
    minLen: (field: string, n: number) => `${field} कम से कम ${n} अक्षर का होना चाहिए`,
    phone: "फ़ोन नंबर बिल्कुल 10 अंकों का होना चाहिए",
    passwordWeak: "पासवर्ड में बड़े, छोटे अक्षर और एक अंक होना चाहिए",
    url: "मान्य URL दर्ज करें",
  },
  en: {
    required: (field: string) => `${field} is required`,
    email: "Enter a valid email address",
    minLen: (field: string, n: number) => `${field} must be at least ${n} characters`,
    phone: "Phone number must be exactly 10 digits",
    passwordWeak: "Password must include upper, lower case letters and a number",
    url: "Enter a valid URL",
  },
};

const portalPasswordField = (lang: "hi" | "en") => {
  const m = portalMessages[lang];
  return z
    .string()
    .min(8, m.minLen(lang === "hi" ? "पासवर्ड" : "Password", 8))
    .max(128)
    .refine((v) => /[a-z]/.test(v) && /[A-Z]/.test(v) && /[0-9]/.test(v), m.passwordWeak);
};

const portalPhoneField = (lang: "hi" | "en") => {
  const m = portalMessages[lang];
  return z.string().optional().refine((v) => !v || /^[0-9]{10}$/.test(v), m.phone);
};

export function portalLoginSchema(lang: "hi" | "en") {
  const m = portalMessages[lang];
  return z.object({
    email: z.string().min(1, m.required(lang === "hi" ? "ईमेल" : "Email")).email(m.email),
    password: z.string().min(1, m.required(lang === "hi" ? "पासवर्ड" : "Password")),
  });
}

export function reporterRegisterSchema(lang: "hi" | "en") {
  const m = portalMessages[lang];
  const nameLabel = lang === "hi" ? "नाम" : "Name";
  const emailLabel = lang === "hi" ? "ईमेल" : "Email";
  return z.object({
    name: z.string().min(2, m.minLen(nameLabel, 2)).max(200, m.required(nameLabel)),
    email: z.string().min(1, m.required(emailLabel)).email(m.email),
    password: portalPasswordField(lang),
    phone: portalPhoneField(lang),
  });
}

export function classifiedPostSchema(lang: "hi" | "en") {
  const m = portalMessages[lang];
  const titleLabel = lang === "hi" ? "शीर्षक" : "Title";
  const contactLabel = lang === "hi" ? "संपर्क नाम" : "Contact name";
  const noContact = lang === "hi"
    ? "फ़ोन या WhatsApp में से कम से कम एक आवश्यक है"
    : "At least one of Phone or WhatsApp is required";
  return z
    .object({
      category: z.string().min(1),
      title: z.string().min(5, m.minLen(titleLabel, 5)).max(300),
      titleHindi: z.string().max(300).optional(),
      description: z.string().max(3000).optional(),
      descriptionHindi: z.string().max(3000).optional(),
      price: z.string().optional().refine((v) => !v || /^[0-9,.\s₹-]+$/.test(v) || /lakh|crore|onwards|month|day|lac/i.test(v), lang === "hi" ? "मान्य कीमत दर्ज करें" : "Enter a valid price"),
      contactName: z.string().max(200).optional().refine((v) => !v || v.trim().length >= 2, m.minLen(contactLabel, 2)),
      contactPhone: z.string().optional().refine((v) => !v || /^[0-9]{10}$/.test(v), m.phone),
      contactWhatsapp: z.string().optional().refine((v) => !v || /^[0-9]{10,13}$/.test(v), lang === "hi" ? "मान्य WhatsApp नंबर दर्ज करें" : "Enter a valid WhatsApp number"),
    })
    .refine((data) => !!(data.contactPhone || data.contactWhatsapp), {
      message: noContact,
      path: ["contactPhone"],
    });
}

export function advertiserRegisterSchema(lang: "hi" | "en") {
  const m = portalMessages[lang];
  const companyLabel = lang === "hi" ? "कंपनी का नाम" : "Company name";
  const contactLabel = lang === "hi" ? "संपर्क व्यक्ति" : "Contact person";
  const emailLabel = lang === "hi" ? "ईमेल" : "Email";
  return z.object({
    companyName: z.string().min(2, m.minLen(companyLabel, 2)),
    contactName: z.string().min(2, m.minLen(contactLabel, 2)),
    email: z.string().min(1, m.required(emailLabel)).email(m.email),
    password: portalPasswordField(lang),
    phone: portalPhoneField(lang),
    website: z.string().optional().refine((v) => !v || /^https?:\/\/.+/.test(v), m.url),
  });
}

export function fieldErrorsFrom(result: { success: boolean; error?: z.ZodError }): Record<string, string> {
  if (result.success || !result.error) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as string;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}
