'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Task, TaskInput } from '@/lib/types/task';
import { revalidatePath } from 'next/cache';

/**
 * Server action to fetch all tasks for the current user
 */
export async function getTasks(): Promise<{ data: Task[] | null; error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient();

    // Get the current session to ensure user is authenticated
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return { data: null, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Task[], error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch tasks',
    };
  }
}

/**
 * Server action to create a new task
 */
export async function createTask(input: TaskInput): Promise<{ data: Task | null; error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return { data: null, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: input.title,
        description: input.description || null,
        priority: input.priority || 'normal',
        due_date: input.due_date || null,
        is_complete: input.is_complete || false,
        user_id: session.user.id,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    revalidatePath('/');
    return { data: data as Task, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create task',
    };
  }
}

/**
 * Server action to update a task (e.g., toggle completion)
 */
export async function updateTask(
  taskId: string,
  updates: Partial<TaskInput>
): Promise<{ data: Task | null; error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return { data: null, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    revalidatePath('/');
    return { data: data as Task, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to update task',
    };
  }
}

/**
 * Server action to delete a task
 */
export async function deleteTask(taskId: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return { error: 'Not authenticated' };
    }

    const { error } = await supabase.from('tasks').delete().eq('id', taskId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/');
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete task',
    };
  }
}
