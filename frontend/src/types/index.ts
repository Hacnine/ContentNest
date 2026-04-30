export type UserRole = 'admin' | 'editor' | 'viewer';
export type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived';
export type MediaType = 'image' | 'video' | 'document';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  provider: 'local' | 'google';
  isActive: boolean;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string | User;
  status: PostStatus;
  featuredImage?: string;
  categories: Category[];
  tags: Tag[];
  seo: PostSEO;
  scheduledAt?: string;
  publishedAt?: string;
  readingTime?: number;
  viewCount: number;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostSEO {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  keywords?: string[];
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Tag {
  _id: string;
  name: string;
  slug: string;
}

export interface Media {
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
  createdAt: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  popularPosts: Array<{ postId: string; slug: string; title: string; views: number }>;
  viewsByDate: Array<{ date: string; views: number }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
