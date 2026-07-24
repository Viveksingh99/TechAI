import { RoleName } from '@prisma/client';

export interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatar: string | null;
  role: RoleName;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: SafeUser;
}
