import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined" && !config.headers["X-Site-ID"]) {
    const siteId = localStorage.getItem("siteId");
    if (siteId) config.headers["X-Site-ID"] = siteId;
  }
  return config;
});

export const publicApi = {
  articles: (params?: Record<string, any>) => api.get("/articles", { params }),
  article: (slug: string) => api.get(`/articles/${slug}`),
  categories: () => api.get("/categories"),
  category: (slug: string) => api.get(`/categories/${slug}`),
  search: (q: string) => api.get("/features/search", { params: { q } }),
  tags: () => api.get("/features/tags"),

  // Features
  rashifal: (rashi?: string) => api.get(rashi ? `/features/rashifal/${rashi}` : "/features/rashifal"),
  webStories: (params?: Record<string, any>) => api.get("/features/web-stories", { params }),
  webStory: (slug: string) => api.get(`/features/web-stories/${slug}`),
  photoGalleries: (params?: Record<string, any>) => api.get("/features/photo-galleries", { params }),
  photoGallery: (slug: string) => api.get(`/features/photo-galleries/${slug}`),
  liveBlog: (articleId: number) => api.get(`/features/live-blogs/${articleId}`),
  topics: (params?: Record<string, any>) => api.get("/features/topics", { params }),
  topic: (slug: string) => api.get(`/features/topics/${slug}`),
  states: () => api.get("/features/locations/states"),
  stateArticles: (slug: string) => api.get(`/features/locations/states/${slug}/articles`),
  cities: (stateSlug: string) => api.get(`/features/locations/states/${stateSlug}/cities`),
  cityArticles: (stateSlug: string, citySlug: string) => api.get(`/features/locations/states/${stateSlug}/cities/${citySlug}/articles`),
  detectLocation: () => api.get("/features/locations/detect"),
  nearestLocation: (lat: number, lng: number) => api.get("/features/locations/nearest", { params: { lat, lng } }),
  vapidPublicKey: () => api.get("/features/push-vapid-key"),
  authors: () => api.get("/features/authors"),
  author: (slug: string) => api.get(`/features/authors/${slug}`),
  reactions: (articleId: number) => api.get(`/features/reactions/${articleId}`),
  comments: (articleId: number) => api.get(`/features/comments/${articleId}`),
  utilityData: () => api.get("/features/utility-data"),
  ad: (zone: string, device?: string) => api.get(`/ads/zone/${zone}`, { params: device ? { device } : undefined }),
  adImpression: (adId: number, sessionId: string) => api.post("/ads/impression", { adId, sessionId }),
  adClick: (adId: number, sessionId: string) => api.post("/ads/click", { adId, sessionId }),

  // Membership
  plans: () => api.get("/membership/plans"),

  // Classifieds
  classifieds: (params?: Record<string, any>) => api.get("/classifieds", { params }),
  classifiedDetail: (id: number) => api.get(`/classifieds/${id}`),
  classifiedPackages: () => api.get("/classifieds/packages"),
  reportClassified: (adId: number, reason: string, reporterName?: string) => api.post("/classifieds/report", { adId, reason, reporterName }),

  // Shok Sandesh
  shokSandesh: (params?: Record<string, any>) => api.get("/shok-sandesh", { params }),
  shokSandeshDetail: (id: number) => api.get(`/shok-sandesh/${id}`),
  shokSandeshPackages: () => api.get("/shok-sandesh/packages"),

  // E-Paper
  epaperIssues: (params?: Record<string, any>) => api.get("/epaper", { params }),
  epaperLatest: () => api.get("/epaper/latest"),
  epaperIssue: (id: number) => api.get(`/epaper/${id}`),
  epaperAdjacent: (id: number) => api.get(`/epaper/${id}/adjacent`),
  epaperByDate: (date: string, edition?: string) => api.get("/epaper/by-date", { params: { date, edition } }),
  epaperCalendar: (month: string, edition?: string) => api.get("/epaper/calendar", { params: { month, edition } }),
  epaperEditionsForDate: (date?: string) => api.get("/epaper/editions-for-date", { params: date ? { date } : undefined }),
  epaperClipUrl: (issueId: number, pageId: number, rect: { x: number; y: number; width: number; height: number }) =>
    `${API_BASE}/api/epaper/${issueId}/pages/${pageId}/clip?x=${rect.x}&y=${rect.y}&width=${rect.width}&height=${rect.height}`,

  // Site
  siteResolve: () => api.get("/sites/resolve"),
};

export const authApi = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
  register: (data: any) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
  updateProfile: (data: any) => api.put("/auth/profile", data),
};

export const customerApi = {
  bookmarks: () => api.get("/features/bookmarks"),
  addBookmark: (articleId: number) => api.post("/features/bookmarks", { articleId }),
  removeBookmark: (articleId: number) => api.delete(`/features/bookmarks/${articleId}`),
  addComment: (articleId: number, content: string) => api.post("/features/comments", { articleId, content }),
  toggleReaction: (articleId: number, reaction: string) => api.post("/features/reactions", { articleId, reaction }),
  readingHistory: () => api.get("/features/reading-history"),
  followTopic: (topicId: number) => api.post(`/features/topics/${topicId}/follow`),
  subscribe: (data: any) => api.post("/membership/subscribe", data),
  mySubscription: () => api.get("/membership/my-subscription"),
  cancelSubscription: () => api.post("/membership/cancel"),
  submitClassified: (data: any) => api.post("/classifieds/submit", data),
  myClassifieds: () => api.get("/classifieds/my-ads"),
  submitShokSandesh: (data: any) => api.post("/shok-sandesh/submit", data),
  pushSubscribe: (data: any) => api.post("/features/push-subscribe", data),
  getNotificationPrefs: () => api.get("/features/notification-prefs"),
  updateNotificationPrefs: (data: any) => api.put("/features/notification-prefs", data),
};
