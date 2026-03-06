export interface Book {
  id?: string;
  title?: string;
  authors?: string[];
  isbn?: string;
  description?: string;
  genres?: string[];
  price_cents?: number;
  currency?: string;
  stock?: number;
  images?: string[];
  publisher?: string;
  published_date?: string;
  language?: string;
  weight_grams?: number;
  dimensions_cm?: string;
  rating_avg?: number;
  review_count?: number;
  seo_meta?: Record<string, unknown>;
}

export interface User {
  id?: string;
  full_name?: string;
  email?: string;
  password_hash?: string;
  role?: string;
  shipping_addresses?: Record<string, unknown>[];
  billing_addresses?: Record<string, unknown>[];
  preferences?: Record<string, unknown>;
  created_at?: string;
  last_login?: string;
}

export interface Cart {
  id?: string;
  user_id?: string;
  items?: Record<string, unknown>[];
  total_cents?: number;
  currency?: string;
  updated_at?: string;
}

export interface Order {
  id?: string;
  user_id?: string;
  items?: Record<string, unknown>[];
  total_cents?: number;
  currency?: string;
  shipping_address?: Record<string, unknown>;
  billing_address?: Record<string, unknown>;
  status?: string;
  payment_status?: string;
  stripe_payment_id?: string;
  tracking_number?: string;
  created_at?: string;
  shipped_at?: string;
  delivered_at?: string;
}

export interface Review {
  id?: string;
  user_id?: string;
  book_id?: string;
  rating?: number;
  title?: string;
  body?: string;
  created_at?: string;
  helpful_count?: number;
  is_moderated?: boolean;
}

export interface Inventory {
  book_id?: string;
  sku?: string;
  stock_level?: number;
  reorder_threshold?: number;
}

export interface Recommendation {
  id?: string;
  user_id?: string;
  book_ids?: string[];
  algorithm?: string;
  created_at?: string;
}

export interface Template {
  id?: string;
  name?: string;
  html?: string;
  css?: string;
  preview_image?: string;
  rating_avg?: number;
  is_active?: boolean;
}

export interface AnalyticsMetric {
  id?: string;
  date?: string;
  metric?: string;
  value?: number;
}

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  results: T[];
  total: number;
  page: number;
  limit: number;
}
