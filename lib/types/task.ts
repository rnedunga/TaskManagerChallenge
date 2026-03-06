/**
 * Task type definition matching the Supabase tasks table schema
 */
export type TaskPriority = 'low' | 'normal' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  is_complete: boolean;
  priority: TaskPriority;
  due_date: string | null; // ISO date string (YYYY-MM-DD)
  user_id: string;
  created_at: string; // ISO timestamp string
  updated_at: string; // ISO timestamp string
}

/**
 * Task input type for creating/updating tasks (excludes auto-generated fields)
 */
export interface TaskInput {
  title: string;
  description?: string | null;
  is_complete?: boolean;
  priority?: TaskPriority;
  due_date?: string | null; // ISO date string (YYYY-MM-DD)
}
