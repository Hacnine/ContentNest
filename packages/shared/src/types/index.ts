// ─── User Types ───────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  provider: 'local' | 'google';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

// ─── Post Types ───────────────────────────────────────────────────────────────

export type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export interface IPostSEO {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  keywords?: string[];
}

export interface IPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string | IUser;
  status: PostStatus;
  featuredImage?: string;
  categories: string[];
  tags: string[];
  seo: IPostSEO;
  scheduledAt?: Date;
  publishedAt?: Date;
  readingTime?: number;
  viewCount: number;
  locale: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatePostDTO {
  title: string;
  content: string;
  excerpt?: string;
  status?: PostStatus;
  featuredImage?: string;
  categories?: string[];
  tags?: string[];
  seo?: IPostSEO;
  scheduledAt?: string;
  locale?: string;
}

export interface IUpdatePostDTO extends Partial<ICreatePostDTO> {}

// ─── Category & Tag Types ─────────────────────────────────────────────────────

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITag {
  _id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Media Types ──────────────────────────────────────────────────────────────

export type MediaType = 'image' | 'video' | 'document';

export interface IMedia {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  publicId: string;
  type: MediaType;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  uploadedBy: string;
  provider: 'cloudinary' | 's3';
  createdAt: Date;
  updatedAt: Date;
}

// ─── Analytics Types ──────────────────────────────────────────────────────────

export interface IPageView {
  _id: string;
  postId: string;
  postSlug: string;
  visitorId: string;
  referrer?: string;
  userAgent?: string;
  country?: string;
  createdAt: Date;
}

export interface IAnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  popularPosts: Array<{ postId: string; slug: string; title: string; views: number }>;
  viewsByDate: Array<{ date: string; views: number }>;
}

// ─── Pagination Types ─────────────────────────────────────────────────────────

export interface IPaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface IPaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
