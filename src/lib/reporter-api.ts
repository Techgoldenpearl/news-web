import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export const reporterApi = axios.create({
  baseURL: `${API_BASE}/api/reporters`,
  withCredentials: true,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export const reporterAuthApi = {
  register: (data: any) => reporterApi.post("/register", data),
  login: (email: string, password: string) => reporterApi.post("/login", { email, password }),
  me: () => reporterApi.get("/me"),
  logout: () => reporterApi.post("/logout"),
  updateProfile: (data: any) => reporterApi.put("/profile", data),
  changePassword: (currentPassword: string, newPassword: string) =>
    reporterApi.put("/change-password", { currentPassword, newPassword }),
  uploadPhoto: (base64: string, fileName: string, mimeType: string) =>
    reporterApi.post("/photo", { base64, fileName, mimeType }),
};

export const reporterSubmissionsApi = {
  list: (params?: Record<string, any>) => reporterApi.get("/submissions", { params }),
  create: (data: any) => reporterApi.post("/submissions", data),
  update: (id: number, data: any) => reporterApi.put(`/submissions/${id}`, data),
  delete: (id: number) => reporterApi.delete(`/submissions/${id}`),
};

export const reporterMiscApi = {
  stats: () => reporterApi.get("/stats"),
  notifications: () => reporterApi.get("/notifications"),
  markNotificationRead: (id: number) => reporterApi.patch(`/notifications/${id}/read`),
  idCard: () => reporterApi.get("/id-card"),
};
