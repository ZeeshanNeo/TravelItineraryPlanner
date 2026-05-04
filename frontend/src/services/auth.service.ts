import api from './api';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  fullName: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  travelPreferences?: Record<string, any>;
  passportDetails?: Record<string, any>;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  travelPreferences?: Record<string, any>;
  passportDetails?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

class AuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.accessToken) {
      localStorage.setItem('access_token', response.data.accessToken);
    }
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    const token = response.data.accessToken || (response.data as any).AccessToken || (response.data as any).token;
    if (token) {
      localStorage.setItem('access_token', token);
    }
    return response.data;
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh-token');
    const token = response.data.accessToken || (response.data as any).AccessToken || (response.data as any).token;
    if (token) {
      localStorage.setItem('access_token', token);
    }
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Logout API failed', e);
    } finally {
      localStorage.removeItem('access_token');
    }
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await api.post('/auth/forgot-password', data);
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await api.post('/auth/reset-password', data);
  }

  async getProfile(): Promise<UserProfileResponse> {
    const response = await api.get<UserProfileResponse>('/profile');
    return response.data;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfileResponse> {
    const response = await api.put<UserProfileResponse>('/profile', data);
    return response.data;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export const authService = new AuthService();