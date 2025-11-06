import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || error.message);
      }
    );
  }

  // Auth
  async register(data: any) {
    return this.client.post('/auth/register', data);
  }

  async login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password });
  }

  async getMe() {
    return this.client.get('/auth/me');
  }

  // Catalog
  async getSites() {
    return this.client.get('/catalog/sites');
  }

  async getCategories() {
    return this.client.get('/catalog/categories');
  }

  async getLabs(params?: { siteId?: string; categoryId?: string }) {
    return this.client.get('/catalog/labs', { params });
  }

  async getLabById(id: string) {
    return this.client.get(`/catalog/labs/${id}`);
  }

  async getComponents(params?: { categoryId?: string }) {
    return this.client.get('/catalog/components', { params });
  }

  async getStaff(params?: { siteId?: string }) {
    return this.client.get('/catalog/staff', { params });
  }

  // Admin catalog management
  async createLab(data: any) {
    return this.client.post('/catalog/labs', data);
  }

  async updateLab(id: string, data: any) {
    return this.client.put(`/catalog/labs/${id}`, data);
  }

  async createComponent(data: any) {
    return this.client.post('/catalog/components', data);
  }

  async updateComponent(id: string, data: any) {
    return this.client.put(`/catalog/components/${id}`, data);
  }

  // Requests
  async createRequest(data: any) {
    return this.client.post('/requests', data);
  }

  async submitRequest(id: string) {
    return this.client.post(`/requests/${id}/submit`);
  }

  async getRequests(params?: { page?: number; limit?: number; status?: string }) {
    return this.client.get('/requests', { params });
  }

  async getRequestById(id: string) {
    return this.client.get(`/requests/${id}`);
  }

  async approveRequest(id: string, data: any) {
    return this.client.post(`/requests/${id}/approve`, data);
  }

  // Availability
  async checkAvailability(data: {
    labId: string;
    siteId: string;
    start: string;
    end: string;
  }) {
    return this.client.post('/availability/check', data);
  }

  async getCalendar(params?: {
    labId?: string;
    siteId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    return this.client.get('/availability/calendar', { params });
  }

  // Invoices
  async getInvoices(params?: { page?: number; limit?: number }) {
    return this.client.get('/billing/invoices', { params });
  }

  async getInvoicePDF(id: string) {
    return this.client.get(`/billing/invoices/${id}/pdf`, {
      responseType: 'blob',
    });
  }

  // Payments
  async createRazorpayOrder(invoiceId: string) {
    return this.client.post('/payments/razorpay/order', { invoiceId });
  }

  async verifyRazorpayPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    return this.client.post('/payments/razorpay/verify', data);
  }

  async uploadBankTransferReceipt(data: {
    invoiceId: string;
    receiptUrl: string;
    transactionId?: string;
    bankName?: string;
  }) {
    return this.client.post('/payments/bank-transfer/upload', data);
  }

  async getPayments(params?: { page?: number; limit?: number }) {
    return this.client.get('/payments', { params });
  }

  // Notifications
  async getNotifications(params?: { page?: number; limit?: number; unreadOnly?: boolean }) {
    return this.client.get('/notifications', { params });
  }

  async markNotificationAsRead(id: string) {
    return this.client.put(`/notifications/${id}/read`);
  }

  async markAllNotificationsAsRead() {
    return this.client.put('/notifications/read-all');
  }

  // Admin
  async getPendingRequests() {
    return this.client.get('/admin/requests/pending');
  }

  async getOrganizations() {
    return this.client.get('/admin/organizations');
  }

  async getUsers() {
    return this.client.get('/admin/users');
  }

  async verifyPayment(paymentId: string, data: { approved: boolean; notes?: string }) {
    return this.client.post(`/admin/payments/${paymentId}/verify`, data);
  }

  async getAuditLogs(params?: { page?: number; limit?: number }) {
    return this.client.get('/admin/audit-logs', { params });
  }
}

export const apiClient = new APIClient();
