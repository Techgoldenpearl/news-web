import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const advertiserApi = axios.create({
  baseURL: `${API_BASE}/api/ads`,
  withCredentials: true,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export const advertiserAuthApi = {
  register: (data: any) => advertiserApi.post("/advertiser/register", data),
  login: (email: string, password: string) => advertiserApi.post("/advertiser/login", { email, password }),
  me: () => advertiserApi.get("/advertiser/me"),
  logout: () => advertiserApi.post("/advertiser/logout"),
};

export const advertiserRequestsApi = {
  list: () => advertiserApi.get("/advertiser/requests"),
  create: (data: any) => advertiserApi.post("/advertiser/request", data),
  stats: () => advertiserApi.get("/advertiser/stats"),
};
