// API Types based on OpenAPI specification
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
  status: 'success';
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'customer';
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

// Product Types
export interface Product {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  sale_price?: number;
  sku: string;
  stock_quantity: number;
  manage_stock: boolean;
  in_stock: boolean;
  featured: boolean;
  status: 'active' | 'inactive' | 'draft';
  category_id: number;
  category?: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  tags: Tag[];
  reviews: ProductReview[];
  average_rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  sku: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  attributes: Record<string, string>;
}

export interface ProductReview {
  id: number;
  product_id: number;
  user_id: number;
  user?: User;
  rating: number;
  title?: string;
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
  created_at: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  short_description?: string;
  price: number;
  sale_price?: number;
  sku: string;
  stock_quantity: number;
  manage_stock: boolean;
  featured: boolean;
  status: 'active' | 'inactive' | 'draft';
  category_id: number;
  tags?: number[];
}

// Category Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: number;
  sort_order: number;
  is_active: boolean;
  products_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parent_id?: number;
  sort_order?: number;
  is_active: boolean;
}

// Cart Types
export interface Cart {
  id: number;
  user_id?: number;
  session_id?: string;
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  coupon?: Coupon;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  product: Product;
  variant_id?: number;
  variant?: ProductVariant;
  quantity: number;
  price: number;
  total: number;
}

export interface AddToCartRequest {
  product_id: number;
  variant_id?: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Order Types
export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  user?: User;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total: number;
  billing_address: Address;
  shipping_address: Address;
  payment_method: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product: Product;
  variant_id?: number;
  variant?: ProductVariant;
  quantity: number;
  price: number;
  total: number;
}

export interface Address {
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface CreateOrderRequest {
  billing_address: Address;
  shipping_address: Address;
  payment_method: string;
  notes?: string;
}

// Banner Types
export interface Banner {
  id: number;
  uuid: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  mobile_image?: string;
  link_url?: string;
  link_text?: string;
  position: 'hero' | 'sidebar' | 'footer';
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBannerRequest {
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  mobile_image?: string;
  link_url?: string;
  link_text?: string;
  position: 'hero' | 'sidebar' | 'footer';
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  sort_order?: number;
}

// Content Types
export interface ContentPage {
  id: number;
  page: string;
  title: string;
  content: Record<string, any>;
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Tag Types
export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTagRequest {
  name: string;
  description?: string;
  color?: string;
}

// Coupon Types
export interface Coupon {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimum_amount?: number;
  maximum_discount?: number;
  usage_limit?: number;
  used_count: number;
  is_active: boolean;
  starts_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCouponRequest {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimum_amount?: number;
  maximum_discount?: number;
  usage_limit?: number;
  is_active: boolean;
  starts_at?: string;
  expires_at?: string;
}

// Role and Permission Types
export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: number[];
}

// Payment Method Types
export interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  is_active: boolean;
  configuration: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentMethodRequest {
  name: string;
  type: string;
  is_active: boolean;
  configuration: Record<string, any>;
}