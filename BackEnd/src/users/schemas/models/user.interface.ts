// BackEnd/src/users/schemas/models/user.interface.ts
import type { UserPlanType } from '../../../shared/utils/org-role.util';

export type { UserPlanType };

export enum UserRule {
  Admin, // 0
  Organization, // 1
  Project, // 2
  Client, // 3
  External, // 4
}

export type UserRoleType = 'OWNER' | 'ADMIN' | 'MEMBER' | 'CLIENT' | 'EXTERNAL';

export interface IUserPreferences {
  preferredStartRoute?: string;
  defaultScriptMode?: string;
  defaultRetinaBalance?: boolean;
  notifyDailyBriefing?: boolean;
  notifySlotGaps?: boolean;
  notifyAiSuggestions?: boolean;
}

export interface IUser {
  _id?: string;
  id?: string;
  email: string;
  name: string;
  password?: string;
  googleId?: string;
  authProvider?: 'local' | 'google';
  isAdmin: boolean;
  rule: UserRule;
  role?: UserRoleType;
  plan?: UserPlanType;
  preRegistered?: boolean;
  allowedProjects?: string[];
  permissions?: string[];
  invitedBy?: string;
  functionId?: string | null;
  avatarUrl?: string;
  displayRole?: string;
  editorialBio?: string;
  twoFactorEnabled?: boolean;
  preferences?: IUserPreferences;
  created_at?: Date;
  modified_at?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}
