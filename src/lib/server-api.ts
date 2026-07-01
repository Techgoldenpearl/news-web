const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function serverFetch(path: string) {
  try {
    const res = await fetch(`${API_BASE}/api${path}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export const serverApi = {
  article: (slug: string) => serverFetch(`/articles/${slug}`),
  category: (slug: string) => serverFetch(`/categories/${slug}`),
  author: (slug: string) => serverFetch(`/features/authors/${slug}`),
  topic: (slug: string) => serverFetch(`/features/topics/${slug}`),
  state: (slug: string) => serverFetch(`/features/locations/states/${slug}/articles`),
  webStory: (slug: string) => serverFetch(`/features/web-stories/${slug}`),
  photoGallery: (slug: string) => serverFetch(`/features/photo-galleries/${slug}`),
};
