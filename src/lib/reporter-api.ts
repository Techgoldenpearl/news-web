import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
};

export const reporterSubmissionsApi = {
  list: (params?: Record<string, any>) => reporterApi.get("/submissions", { params }),
  create: (data: any) => reporterApi.post("/submissions", data),
};

export const reporterMiscApi = {
  stats: () => reporterApi.get("/stats"),
  notifications: () => reporterApi.get("/notifications"),
  markNotificationRead: (id: number) => reporterApi.patch(`/notifications/${id}/read`),
  idCard: () => reporterApi.get("/id-card"),
};
