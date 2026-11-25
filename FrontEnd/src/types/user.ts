//src/types/IUser.ts
export type RoleType = 'OWNER' | 'ADMIN' | 'MEMBER' | 'CLIENT' | 'EXTERNAL';
export type UserPlanType = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface IUser {
  _id: string; 
  id?: string;  
  email: string;
  name: string;
  password?: string; 
  isAdmin: boolean;
  role: RoleType;
  plan?: UserPlanType;
  preRegistered?: boolean;
  allowedProjects?: string[];
  permissions?: string[];
  invitedBy?: string;
  functionId?: string | null;
  avatarUrl?: string; 
  created_at?: Date;
  modified_at?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}