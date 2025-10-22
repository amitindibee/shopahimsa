
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getPublicKey, encryptPayload } from './auth';
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  Product,
  CreateProductRequest,
  Category,
  CreateCategoryRequest,
  Cart,
  AddToCartRequest,
  UpdateCartItemRequest,
  Order,
  CreateOrderRequest,
  Banner,
  CreateBannerRequest,
  ContentPage,
  Tag,
  CreateTagRequest,
  Coupon,
  CreateCouponRequest,
  Role,
  CreateRoleRequest,
  Permission,
  PaymentMethod,
  CreatePaymentMethodRequest,
  ProductReview,
} from './types/api';

class ApiService {
  private api: AxiosInstance;
  private publicKey: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://api.ahimsapure.com/api/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config) => {
      const user = this.getStoredUser();
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear stored user data on unauthorized
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private getStoredUser(): { token: string; user: User } | null {
    if (typeof window === 'undefined') return null;
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const userData = JSON.parse(userString);
        return userData.data || userData;
      } catch {
        return null;
      }
    }
    return null;
  }

  private async getPublicKeyIfNeeded(): Promise<string> {
    if (!this.publicKey) {
      this.publicKey = await getPublicKey();
    }
    return this.publicKey;
  }

  private async encryptRequest(payload: any): Promise<{ payload: string }> {
    const publicKey = await this.getPublicKeyIfNeeded();
    const encryptedPayload = encryptPayload(payload, publicKey);
    return { payload: encryptedPayload };
  }

  // Authentication endpoints
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const encryptedData = await this.encryptRequest(data);
    const response = await this.api.post<ApiResponse<AuthResponse>>('/auth/login', encryptedData);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const encryptedData = await this.encryptRequest(data);
    const response = await this.api.post<ApiResponse<AuthResponse>>('/auth/register', encryptedData);
    return response.data;
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    const encryptedData = await this.encryptRequest({ email });
    const response = await this.api.post<ApiResponse>('/auth/forgot-password', encryptedData);
    return response.data;
  }

  async resetPassword(data: { email: string; code: string; password: string }): Promise<ApiResponse> {
    const encryptedData = await this.encryptRequest(data);
    const response = await this.api.post<ApiResponse>('/auth/reset-password', encryptedData);
    return response.data;
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    const response = await this.api.get<ApiResponse>(`/auth/verify-email/${token}`);
    return response.data;
  }

  async resendVerification(email: string): Promise<ApiResponse> {
    const encryptedData = await this.encryptRequest({ email });
    const response = await this.api.post<ApiResponse>('/auth/resend-verification', encryptedData);
    return response.data;
  }

  // User endpoints
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await this.api.get<ApiResponse<User>>('/users/me');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.api.put<ApiResponse<User>>('/users/me', data);
    return response.data;
  }

  // Product endpoints
  async getProducts(params?: PaginationParams): Promise<PaginatedResponse<Product>> {
    const response = await this.api.get<PaginatedResponse<Product>>('/products', { params });
    return response.data;
  }

  async getFeaturedProducts(params?: PaginationParams): Promise<PaginatedResponse<Product>> {
    const response = await this.api.get<PaginatedResponse<Product>>('/products/featured', { params });
    return response.data;
  }

  async searchProducts(params?: PaginationParams): Promise<PaginatedResponse<Product>> {
    const response = await this.api.get<PaginatedResponse<Product>>('/products/search', { params });
    return response.data;
  }

  async getProductsByCategory(categoryId: number, params?: PaginationParams): Promise<PaginatedResponse<Product>> {
    const response = await this.api.get<PaginatedResponse<Product>>(`/products/category/${categoryId}`, { params });
    return response.data;
  }

  async getProduct(identifier: string): Promise<ApiResponse<Product>> {
    const response = await this.api.get<ApiResponse<Product>>(`/products/${identifier}`);
    return response.data;
  }

  async getProductReviews(uuid: string): Promise<PaginatedResponse<ProductReview>> {
    const response = await this.api.get<PaginatedResponse<ProductReview>>(`/products/${uuid}/reviews`);
    return response.data;
  }

  async createProductReview(uuid: string, data: { rating: number; title?: string; comment: string }): Promise<ApiResponse<ProductReview>> {
    const response = await this.api.post<ApiResponse<ProductReview>>(`/products/${uuid}/reviews`, data);
    return response.data;
  }

  // Category endpoints
  async getCategories(params?: PaginationParams): Promise<PaginatedResponse<Category>> {
    const response = await this.api.get<PaginatedResponse<Category>>('/categories', { params });
    return response.data;
  }

  async getCategory(id: number): Promise<ApiResponse<Category>> {
    const response = await this.api.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data;
  }

  // Cart endpoints
  async getCart(): Promise<ApiResponse<Cart>> {
    const response = await this.api.get<ApiResponse<Cart>>('/cart');
    return response.data;
  }

  async addToCart(data: AddToCartRequest): Promise<ApiResponse<Cart>> {
    const response = await this.api.post<ApiResponse<Cart>>('/cart/items', data);
    return response.data;
  }

  async updateCartItem(itemId: number, data: UpdateCartItemRequest): Promise<ApiResponse<Cart>> {
    const response = await this.api.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, data);
    return response.data;
  }

  async removeCartItem(itemId: number): Promise<void> {
    await this.api.delete(`/cart/items/${itemId}`);
  }

  async clearCart(): Promise<void> {
    await this.api.delete('/cart');
  }

  async applyCoupon(code: string): Promise<ApiResponse<Cart>> {
    const response = await this.api.post<ApiResponse<Cart>>('/cart/coupon', { code });
    return response.data;
  }

  async removeCoupon(): Promise<void> {
    await this.api.delete('/cart/coupon');
  }

  async getCartSummary(): Promise<ApiResponse<any>> {
    const response = await this.api.get<ApiResponse<any>>('/cart/summary');
    return response.data;
  }

  // Order endpoints
  async getUserOrders(params?: PaginationParams): Promise<PaginatedResponse<Order>> {
    const response = await this.api.get<PaginatedResponse<Order>>('/orders/my', { params });
    return response.data;
  }

  async getOrder(id: number): Promise<ApiResponse<Order>> {
    const response = await this.api.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  }

  async createOrder(data: CreateOrderRequest): Promise<ApiResponse<Order>> {
    const response = await this.api.post<ApiResponse<Order>>('/orders', data);
    return response.data;
  }

  // Banner endpoints
  async getBanners(params?: PaginationParams): Promise<PaginatedResponse<Banner>> {
    const response = await this.api.get<PaginatedResponse<Banner>>('/banners', { params });
    return response.data;
  }

  async getActiveBanners(params?: PaginationParams): Promise<PaginatedResponse<Banner>> {
    const response = await this.api.get<PaginatedResponse<Banner>>('/banners/active', { params });
    return response.data;
  }

  async getBanner(uuid: string): Promise<ApiResponse<Banner>> {
    const response = await this.api.get<ApiResponse<Banner>>(`/banners/${uuid}`);
    return response.data;
  }

  // Content endpoints
  async getAvailablePages(): Promise<PaginatedResponse<ContentPage>> {
    const response = await this.api.get<PaginatedResponse<ContentPage>>('/content/pages');
    return response.data;
  }

  async getPageContent(page: string): Promise<ApiResponse<ContentPage>> {
    const response = await this.api.get<ApiResponse<ContentPage>>(`/content/${page}`);
    return response.data;
  }

  // Admin endpoints
  // Admin - Users
  async adminGetUsers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    const response = await this.api.get<PaginatedResponse<User>>('/admin/users', { params });
    return response.data;
  }

  async adminGetUser(id: number): Promise<ApiResponse<User>> {
    const response = await this.api.get<ApiResponse<User>>(`/admin/users/${id}`);
    return response.data;
  }

  async adminCreateUser(data: RegisterRequest): Promise<ApiResponse<User>> {
    const response = await this.api.post<ApiResponse<User>>('/admin/users', data);
    return response.data;
  }

  async adminUpdateUser(id: number, data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.api.put<ApiResponse<User>>(`/admin/users/${id}`, data);
    return response.data;
  }

  async adminDeleteUser(id: number): Promise<void> {
    await this.api.delete(`/admin/users/${id}`);
  }

  // Admin - Products
  async adminCreateProduct(data: CreateProductRequest): Promise<ApiResponse<Product>> {
    const response = await this.api.post<ApiResponse<Product>>('/admin/products', data);
    return response.data;
  }

  async adminUpdateProduct(uuid: string, data: Partial<CreateProductRequest>): Promise<ApiResponse<Product>> {
    const response = await this.api.put<ApiResponse<Product>>(`/admin/products/${uuid}`, data);
    return response.data;
  }

  async adminDeleteProduct(uuid: string): Promise<void> {
    await this.api.delete(`/admin/products/${uuid}`);
  }

  async adminUploadProductImages(uuid: string, data: FormData): Promise<ApiResponse<any>> {
    const response = await this.api.post<ApiResponse<any>>(`/admin/products/${uuid}/images`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async adminDeleteProductImage(uuid: string, imageId: number): Promise<void> {
    await this.api.delete(`/admin/products/${uuid}/images/${imageId}`);
  }

  // Admin - Categories
  async adminCreateCategory(data: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    const response = await this.api.post<ApiResponse<Category>>('/admin/categories', data);
    return response.data;
  }

  async adminUpdateCategory(id: number, data: Partial<CreateCategoryRequest>): Promise<ApiResponse<Category>> {
    const response = await this.api.put<ApiResponse<Category>>(`/admin/categories/${id}`, data);
    return response.data;
  }

  async adminDeleteCategory(id: number): Promise<void> {
    await this.api.delete(`/admin/categories/${id}`);
  }

  // Admin - Orders
  async adminGetOrders(params?: PaginationParams): Promise<PaginatedResponse<Order>> {
    const response = await this.api.get<PaginatedResponse<Order>>('/admin/orders', { params });
    return response.data;
  }

  async adminUpdateOrder(id: number, data: { status?: string; payment_status?: string; notes?: string }): Promise<ApiResponse<Order>> {
    const response = await this.api.put<ApiResponse<Order>>(`/admin/orders/${id}`, data);
    return response.data;
  }

  async adminDeleteOrder(id: number): Promise<void> {
    await this.api.delete(`/admin/orders/${id}`);
  }

  // Admin - Banners
  async adminCreateBanner(data: CreateBannerRequest): Promise<ApiResponse<Banner>> {
    const response = await this.api.post<ApiResponse<Banner>>('/admin/banners', data);
    return response.data;
  }

  async adminUpdateBanner(uuid: string, data: Partial<CreateBannerRequest>): Promise<ApiResponse<Banner>> {
    const response = await this.api.put<ApiResponse<Banner>>(`/admin/banners/${uuid}`, data);
    return response.data;
  }

  async adminDeleteBanner(uuid: string): Promise<void> {
    await this.api.delete(`/admin/banners/${uuid}`);
  }

  // Admin - Tags
  async adminGetTags(params?: PaginationParams): Promise<PaginatedResponse<Tag>> {
    const response = await this.api.get<PaginatedResponse<Tag>>('/admin/tags', { params });
    return response.data;
  }

  async adminGetTag(id: number): Promise<ApiResponse<Tag>> {
    const response = await this.api.get<ApiResponse<Tag>>(`/admin/tags/${id}`);
    return response.data;
  }

  async adminCreateTag(data: CreateTagRequest): Promise<ApiResponse<Tag>> {
    const response = await this.api.post<ApiResponse<Tag>>('/admin/tags', data);
    return response.data;
  }

  async adminUpdateTag(id: number, data: Partial<CreateTagRequest>): Promise<ApiResponse<Tag>> {
    const response = await this.api.put<ApiResponse<Tag>>(`/admin/tags/${id}`, data);
    return response.data;
  }

  async adminDeleteTag(id: number): Promise<void> {
    await this.api.delete(`/admin/tags/${id}`);
  }

  // Admin - Roles
  async adminGetRoles(params?: PaginationParams): Promise<PaginatedResponse<Role>> {
    const response = await this.api.get<PaginatedResponse<Role>>('/admin/roles', { params });
    return response.data;
  }

  async adminGetRole(id: number): Promise<ApiResponse<Role>> {
    const response = await this.api.get<ApiResponse<Role>>(`/admin/roles/${id}`);
    return response.data;
  }

  async adminCreateRole(data: CreateRoleRequest): Promise<ApiResponse<Role>> {
    const response = await this.api.post<ApiResponse<Role>>('/admin/roles', data);
    return response.data;
  }

  async adminUpdateRole(id: number, data: Partial<CreateRoleRequest>): Promise<ApiResponse<Role>> {
    const response = await this.api.put<ApiResponse<Role>>(`/admin/roles/${id}`, data);
    return response.data;
  }

  async adminDeleteRole(id: number): Promise<void> {
    await this.api.delete(`/admin/roles/${id}`);
  }

  // Admin - Permissions
  async adminGetPermissions(params?: PaginationParams): Promise<PaginatedResponse<Permission>> {
    const response = await this.api.get<PaginatedResponse<Permission>>('/admin/permissions', { params });
    return response.data;
  }

  async adminGetPermission(id: number): Promise<ApiResponse<Permission>> {
    const response = await this.api.get<ApiResponse<Permission>>(`/admin/permissions/${id}`);
    return response.data;
  }

  async adminCreatePermission(data: { name: string; description?: string }): Promise<ApiResponse<Permission>> {
    const response = await this.api.post<ApiResponse<Permission>>('/admin/permissions', data);
    return response.data;
  }

  async adminUpdatePermission(id: number, data: { name?: string; description?: string }): Promise<ApiResponse<Permission>> {
    const response = await this.api.put<ApiResponse<Permission>>(`/admin/permissions/${id}`, data);
    return response.data;
  }

  async adminDeletePermission(id: number): Promise<void> {
    await this.api.delete(`/admin/permissions/${id}`);
  }

  // Admin - Payment Methods
  async adminGetPaymentMethods(params?: PaginationParams): Promise<PaginatedResponse<PaymentMethod>> {
    const response = await this.api.get<PaginatedResponse<PaymentMethod>>('/admin/payment-methods', { params });
    return response.data;
  }

  async adminGetPaymentMethod(id: number): Promise<ApiResponse<PaymentMethod>> {
    const response = await this.api.get<ApiResponse<PaymentMethod>>(`/admin/payment-methods/${id}`);
    return response.data;
  }

  async adminCreatePaymentMethod(data: CreatePaymentMethodRequest): Promise<ApiResponse<PaymentMethod>> {
    const response = await this.api.post<ApiResponse<PaymentMethod>>('/admin/payment-methods', data);
    return response.data;
  }

  async adminUpdatePaymentMethod(id: number, data: Partial<CreatePaymentMethodRequest>): Promise<ApiResponse<PaymentMethod>> {
    const response = await this.api.put<ApiResponse<PaymentMethod>>(`/admin/payment-methods/${id}`, data);
    return response.data;
  }

  async adminDeletePaymentMethod(id: number): Promise<void> {
    await this.api.delete(`/admin/payment-methods/${id}`);
  }

  // Admin - Content
  async adminGetAllContent(params?: PaginationParams): Promise<PaginatedResponse<ContentPage>> {
    const response = await this.api.get<PaginatedResponse<ContentPage>>('/admin/content', { params });
    return response.data;
  }

  async adminSaveContent(page: string, data: { title: string; content: Record<string, any>; meta_title?: string; meta_description?: string; is_active: boolean }): Promise<ApiResponse<ContentPage>> {
    const response = await this.api.put<ApiResponse<ContentPage>>(`/admin/content/${page}`, data);
    return response.data;
  }

  async adminDeleteContent(page: string): Promise<void> {
    await this.api.delete(`/admin/content/${page}`);
  }

  async adminGetContentHistory(page: string): Promise<ApiResponse<any>> {
    const response = await this.api.get<ApiResponse<any>>(`/admin/content/${page}/history`);
    return response.data;
  }

  async adminRestoreContent(page: string, data: { version_id: number }): Promise<ApiResponse<ContentPage>> {
    const response = await this.api.post<ApiResponse<ContentPage>>(`/admin/content/${page}/restore`, data);
    return response.data;
  }

  async adminValidateContent(data: any): Promise<ApiResponse<any>> {
    const response = await this.api.post<ApiResponse<any>>('/admin/content/validate', data);
    return response.data;
  }

  async adminBulkContentOperations(data: any): Promise<ApiResponse<any>> {
    const response = await this.api.post<ApiResponse<any>>('/admin/content/bulk', data);
    return response.data;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Also export the class for testing purposes
export { ApiService };
