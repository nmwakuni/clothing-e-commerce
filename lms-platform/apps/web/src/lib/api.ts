/**
 * API Client for SkillHub Africa
 * Handles all API communication with authentication
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  requireAuth?: boolean;
}

async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, requireAuth = false } = options;

  // Get auth token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Build headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (requireAuth && token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Build request
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include',
  };

  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  // Make request
  const response = await fetch(`${API_URL}${endpoint}`, requestOptions);

  // Handle errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(response.status, errorData.error || 'Request failed', errorData);
  }

  // Parse response
  return response.json();
}

// Auth API
export const authAPI = {
  async sendMagicLink(phoneNumber: string) {
    return apiRequest<{ success: boolean; message: string; expiresAt: string }>(
      '/api/auth/magic-link',
      {
        method: 'POST',
        body: { phoneNumber },
      }
    );
  },

  async verifyToken(token: string) {
    return apiRequest<{
      success: boolean;
      user: any;
      token: string;
      expiresAt: string;
    }>('/api/auth/verify', {
      method: 'POST',
      body: { token },
    });
  },

  async getMe() {
    return apiRequest<{ user: any }>('/api/auth/me', {
      requireAuth: true,
    });
  },

  async refreshToken(token: string) {
    return apiRequest<{ success: boolean; token: string; expiresAt: string }>('/api/auth/refresh', {
      method: 'POST',
      body: { token },
    });
  },
};

// Courses API
export const coursesAPI = {
  async listCourses(filters?: { category?: string; difficulty?: string }) {
    const params = new URLSearchParams(filters as any);
    return apiRequest<{ courses: any[]; total: number }>(`/api/courses?${params.toString()}`);
  },

  async getCourse(slug: string) {
    return apiRequest<any>(`/api/courses/${slug}`);
  },

  async enrollCourse(courseId: string, transactionId?: string) {
    return apiRequest<{
      success: boolean;
      enrollmentId: string;
      message: string;
    }>(`/api/courses/${courseId}/enroll`, {
      method: 'POST',
      body: { transactionId },
      requireAuth: true,
    });
  },

  async getProgress(courseId: string) {
    return apiRequest<{ enrollment: any; progress: any[] }>(`/api/courses/${courseId}/progress`, {
      requireAuth: true,
    });
  },

  async completeLesson(courseId: string, lessonId: string, timeSpentSeconds?: number) {
    return apiRequest<{
      success: boolean;
      message: string;
      progressPercentage: number;
    }>(`/api/courses/${courseId}/lessons/${lessonId}/complete`, {
      method: 'POST',
      body: { timeSpentSeconds },
      requireAuth: true,
    });
  },
};

// Payments API
export const paymentsAPI = {
  async initiateSTKPush(data: {
    phoneNumber: string;
    amount: number;
    accountReference: string;
    transactionDesc: string;
  }) {
    return apiRequest<{
      success: boolean;
      message: string;
      CheckoutRequestID: string;
      MerchantRequestID: string;
    }>('/api/payments/mpesa/stk-push', {
      method: 'POST',
      body: data,
      requireAuth: true,
    });
  },

  async checkPaymentStatus(checkoutRequestId: string) {
    return apiRequest<{
      status: 'processing' | 'completed' | 'failed';
      mpesaReceiptNumber?: string;
      amount?: number;
      error?: string;
    }>(`/api/payments/mpesa/status?checkoutRequestId=${checkoutRequestId}`, {
      requireAuth: true,
    });
  },

  async getPaymentHistory() {
    return apiRequest<{ transactions: any[] }>('/api/payments/history', {
      requireAuth: true,
    });
  },
};

// Helper to check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}

// Helper to get current user from localStorage
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Helper to logout
export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export { APIError };
