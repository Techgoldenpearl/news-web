// Shared type definitions for news-web.
//
// The backend API is loosely typed (many endpoints accept/return arbitrary
// objects), so these interfaces are intentionally generous with optional
// fields. Their purpose is to stop components from re-declaring overlapping
// `any`-typed shapes, not to retroactively enforce a strict backend contract.

export interface Tag {
  id: number;
  slug: string;
  name: string;
  nameHindi?: string;
}

export interface Category {
  id: number;
  siteId?: number | null;
  slug: string;
  name: string;
  nameHindi?: string;
  color?: string;
  description?: string;
  showInNav?: boolean;
  articleCount?: number;
}

export interface Author {
  id: number;
  slug: string;
  name: string;
  nameHindi?: string;
  bio?: string;
  bioHindi?: string;
  avatarUrl?: string;
  twitterHandle?: string;
}

export interface State {
  id: number;
  name: string;
  nameHindi?: string;
  slug: string;
}

export interface City {
  id: number;
  name: string;
  nameHindi?: string;
  slug: string;
}

export interface Article {
  id: number;
  slug: string;
  title: string;
  titleHindi?: string;
  summary?: string;
  summaryHindi?: string;
  content?: string; // HTML, rendered via dangerouslySetInnerHTML
  thumbnailUrl?: string;
  thumbnailCaption?: string;
  contentType?: "video" | "article" | string;
  videoType?: "youtube" | "direct";
  videoUrl?: string;
  categoryId?: number;
  category?: { slug: string; name: string; nameHindi?: string; color?: string };
  categoryName?: string;
  categoryNameHindi?: string;
  categorySlug?: string;
  categoryColor?: string;
  author?: Author;
  authorSlug?: string;
  publishedAt?: string;
  readTimeMinutes?: number;
  viewsCount?: number;
  isBreaking?: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
  isPremium?: boolean;
  isPremiumLocked?: boolean;
  hasLiveBlog?: boolean;
  tags?: Tag[];
}

export interface Comment {
  id: number;
  parentId?: number;
  userName?: string;
  content: string;
  createdAt: string;
  replies?: Comment[];
}

export interface Site {
  id: number;
  name: string;
  slug: string;
  language: string;
  region?: string;
  tagline?: string;
  primaryColor?: string;
  logoUrl?: string;
  domain?: string;
  subdomain?: string;
  description?: string;
  address?: string;
  email?: string;
  phone?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    whatsapp?: string;
  };
  theme?: { primaryColor?: string; secondaryColor?: string; headerBg?: string };
  seoDefaults?: { metaDescription?: string };
}

export interface ReaderUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  role: string;
  avatarUrl?: string;
  subscription?: any;
}

export interface Reporter {
  id: number;
  employeeId: string;
  name: string;
  nameHindi?: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  designation?: string;
  beat?: string;
  city?: string;
  state?: string;
  status: "pending" | "active" | "suspended" | "rejected";
  bio?: string;
  twitterHandle?: string;
  facebookUrl?: string;
  idCardExpiry?: string;
  submissionsCount?: number;
  approvedCount?: number;
  totalViewsCount?: number;
}

export interface Advertiser {
  id: number;
  companyName: string;
  contactName?: string;
  email: string;
  phone?: string;
  gstNumber?: string;
  website?: string;
  status: "pending" | "active" | "suspended";
}

export interface ShokSandeshEntry {
  id: number;
  type: string;
  name: string;
  nameHindi?: string;
  age?: number;
  photoUrl?: string;
  familyName?: string;
  dateOfDeath?: string;
  city?: string;
  state?: string;
  message?: string;
  eventDate?: string;
  eventPlace?: string;
  isPaidPublication?: boolean;
  paymentStatus?: "paid" | "due" | "nil";
  createdAt?: string;
}

export interface EpaperIssue {
  id: number;
  edition: string;
  editionSlug?: string;
  date: string;
  coverImageUrl?: string;
  pageCount?: number;
}

export interface RashifalSign {
  slug: string;
  name: string;
  nameHindi: string;
  symbol: string;
}

/**
 * The public search endpoint (`publicApi.search`) uniquely returns
 * snake_case fields, unlike every other endpoint in the API. This
 * normalizes a raw search result item into the camelCase `Article` shape
 * used everywhere else, so callers don't need to hand-roll the remap.
 */
export function normalizeSearchArticle(raw: any): Article {
  return {
    id: raw.id,
    title: raw.title,
    titleHindi: raw.title_hindi,
    slug: raw.slug,
    summary: raw.summary,
    summaryHindi: raw.summary_hindi,
    thumbnailUrl: raw.thumbnail_url,
    publishedAt: raw.published_at,
    isBreaking: raw.is_breaking,
    isTrending: raw.is_trending,
    contentType: raw.content_type,
    categoryName: raw.category_name,
    categoryNameHindi: raw.category_name_hindi,
    categorySlug: raw.category_slug,
    categoryColor: raw.category_color,
    viewsCount: raw.views_count,
    readTimeMinutes: raw.read_time_minutes,
  };
}
