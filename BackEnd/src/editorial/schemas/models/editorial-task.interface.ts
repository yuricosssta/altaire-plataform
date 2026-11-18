export type TaskOrigin = 'Manual' | 'IA sugerida' | 'Automática';
export type TaskDueCategory = 'today' | 'upcoming';

export interface IEditorialTask {
  _id?: string;
  id?: string;
  userId: string;
  orgId: string;
  projectId?: string;
  title: string;
  dueLabel: string;
  dueCategory: TaskDueCategory;
  origin: TaskOrigin;
  completed: boolean;
  postponed?: boolean;
  resourceLabel?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateEditorialTask {
  userId: string;
  orgId: string;
  projectId?: string;
  title: string;
  dueLabel?: string;
  dueCategory?: TaskDueCategory;
  origin?: TaskOrigin;
  completed?: boolean;
  postponed?: boolean;
  resourceLabel?: string;
}

export interface IUpdateEditorialTask {
  title?: string;
  dueLabel?: string;
  dueCategory?: TaskDueCategory;
  completed?: boolean;
  postponed?: boolean;
  resourceLabel?: string;
}
