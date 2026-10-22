// FrontEnd/src/types/auth.ts

export type UserRole = "owner" | "strategist" | "editor" | "viewer";
export type SubscriptionTier = "free" | "individual" | "pro" | "agency";

export interface ActiveProjectContext {
  id: string;
  name: string;
  niche: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  tier: SubscriptionTier;
  avatarUrl?: string;
  hasActiveProject: boolean;
  activeProjectContext?: ActiveProjectContext | null;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: UserSession;
  redirectUrl?: string;
  token?: string;
}