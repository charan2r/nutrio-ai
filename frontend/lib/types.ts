export interface User {
  id: string;
  email: string;
  isGuest?: boolean;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  email: string;
  password?: string;
}

export interface OnboardingStatusResponse {
  isOnboarded: boolean;
  hasProfile: boolean;
  hasPreferences: boolean;
}
