import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { 
  ApiResponse, 
  AuthResponse, 
  LoginData, 
  RegisterData, 
  Lead, 
  LeadsByStatus, 
  LeadStatistics, 
  CreateLeadData, 
  UpdateLeadData 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh and errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry && !this.isRefreshing) {
          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              if (response.success && response.data) {
                localStorage.setItem('access_token', response.data.access_token);
                this.isRefreshing = false;
                return this.api(originalRequest);
              }
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            this.isRefreshing = false;
            this.handleLogout();
            return Promise.reject(refreshError);
          }
          
          this.isRefreshing = false;
        }

        // Handle other errors
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiResponse {
    if (error.response?.data) {
      return error.response.data as ApiResponse;
    }

    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        message: 'Request timeout. Please try again.',
      };
    }

    if (!navigator.onLine) {
      return {
        success: false,
        message: 'No internet connection. Please check your network.',
      };
    }

    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
    };
  }

  private handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  // Auth endpoints
  async login(data: LoginData): Promise<ApiResponse<AuthResponse['data']>> {
    try {
      const response = await this.api.post('/auth/login/', data);
      return {
        success: true,
        message: 'Login successful',
        data: response.data.data, // Unwrap backend response
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async register(data: RegisterData): Promise<ApiResponse<AuthResponse['data']>> {
    try {
      const response = await this.api.post('/auth/register/', data);
      return {
        success: true,
        message: 'Registration successful',
        data: response.data.data, // Unwrap backend response
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await this.api.post('/auth/logout/', { refresh_token: refreshToken });
      }
      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      // Even if logout fails on server, we should clear local storage
      return {
        success: true,
        message: 'Logout completed',
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ access_token: string }>> {
    try {
      const response = await this.api.post('/auth/token/refresh/', {
        refresh: refreshToken,
      });
      return {
        success: true,
        message: 'Token refreshed',
        data: response.data.data || response.data, // Handle both wrapped and unwrapped responses
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async verifyToken(): Promise<ApiResponse> {
    try {
      await this.api.post('/auth/token/verify/');
      return {
        success: true,
        message: 'Token is valid',
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // Lead endpoints
  async getLeadsByStatus(): Promise<ApiResponse<LeadsByStatus>> {
    try {
      const response = await this.api.get('/leads/by-status/');
      return {
        success: response.data.success || true,
        message: response.data.message || 'Leads fetched successfully',
        data: response.data.data, // Backend already wraps in { success, data }
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async getLeadStatistics(): Promise<ApiResponse<LeadStatistics>> {
    try {
      const response = await this.api.get('/leads/statistics/');
      return {
        success: response.data.success || true,
        message: response.data.message || 'Statistics fetched successfully',
        data: response.data.data, // Backend already wraps in { success, data }
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async getLeads(): Promise<ApiResponse<Lead[]>> {
    try {
      const response = await this.api.get('/leads/');
      return {
        success: true,
        message: 'Leads fetched successfully',
        data: response.data,
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async createLead(data: CreateLeadData): Promise<ApiResponse<Lead>> {
    try {
      const response = await this.api.post('/leads/', data);
      return {
        success: response.data.success || true,
        message: response.data.message || 'Lead created successfully',
        data: response.data.data || response.data, // Handle both wrapped and direct responses
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async updateLead(id: number, data: UpdateLeadData): Promise<ApiResponse<Lead>> {
    try {
      const response = await this.api.patch(`/leads/${id}/`, data);
      return {
        success: response.data.success || true,
        message: response.data.message || 'Lead updated successfully',
        data: response.data.data || response.data, // Handle both wrapped and direct responses
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async updateLeadStatus(id: number, status: string): Promise<ApiResponse<Lead>> {
    try {
      const response = await this.api.patch(`/leads/${id}/`, { status });
      return {
        success: response.data.success || true,
        message: response.data.message || 'Lead status updated successfully',
        data: response.data.data || response.data, // Handle both wrapped and direct responses
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async deleteLead(id: number): Promise<ApiResponse> {
    try {
      await this.api.delete(`/leads/${id}/`);
      return {
        success: true,
        message: 'Lead deleted successfully',
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async createDemoData(): Promise<ApiResponse> {
    try {
      const demoLeads = [
        {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          lead_source: 'website',
          notes: 'Interested in our premium package'
        },
        {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+1234567891',
          lead_source: 'social_media',
          notes: 'Contacted via LinkedIn'
        },
        {
          name: 'Bob Johnson',
          email: 'bob.johnson@example.com',
          phone: '+1234567892',
          lead_source: 'referral',
          notes: 'Referred by existing customer'
        },
        {
          name: 'Alice Brown',
          email: 'alice.brown@example.com',
          phone: '+1234567893',
          lead_source: 'google_ads',
          notes: 'Clicked on our Google ad'
        },
        {
          name: 'Charlie Wilson',
          email: 'charlie.wilson@example.com',
          phone: '+1234567894',
          lead_source: 'email_marketing',
          notes: 'Responded to email campaign'
        }
      ];

      // Create all demo leads
      await Promise.all(demoLeads.map(lead => this.createLead(lead)));

      return {
        success: true,
        message: 'Demo data created successfully',
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // Profile endpoints
  async updateProfile(data: {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.patch('/auth/profile/', data);
      return {
        success: response.data.success || true,
        message: response.data.message || 'Profile updated successfully',
        data: response.data.data || response.data.user,
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async changePassword(data: {
    old_password: string;
    new_password: string;
  }): Promise<ApiResponse> {
    try {
      const response = await this.api.post('/auth/change-password/', data);
      return {
        success: response.data.success || true,
        message: response.data.message || 'Password changed successfully',
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // Utility methods
  setAuthToken(token: string) {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.api.defaults.headers.common['Authorization'];
  }
}

// Export a singleton instance
const apiService = new ApiService();
export default apiService; 