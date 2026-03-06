'use client';

import { useState } from 'react';
import { Trash2, Calendar, AlertCircle } from 'lucide-react';
import { updateTask, deleteTask } from '@/app/actions/tasks';
import type { Task } from '@/lib/types/task';

interface TaskItemProps {
  task: Task;
  onUpdate?: () => void;
  onError?: (error: string) => void;
}

export function TaskItem({ task, onUpdate, onError }: TaskItemProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleComplete = async () => {
    setIsToggling(true);
    const result = await updateTask(task.id, { is_complete: !task.is_complete });
    setIsToggling(false);

    if (result.error) {
      onError?.(result.error);
    } else {
      onUpdate?.();
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteTask(task.id);
    setIsDeleting(false);

    if (result.error) {
      onError?.(result.error);
    } else {
      onUpdate?.();
    }
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    normal: 'bg-blue-100 text-blue-800',
    high: 'bg-red-100 text-red-800',
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue =
    task.due_date && !task.is_complete && new Date(task.due_date) < new Date();

  return (
    <div
      className={`rounded-lg border p-4 transition-all ${
        task.is_complete
          ? 'border-gray-200 bg-gray-50 opacity-75'
          : 'border-gray-200 bg-white shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.is_complete}
          onChange={handleToggleComplete}
          disabled={isToggling}
          className="mt-1 h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3
                className={`font-medium ${
                  task.is_complete ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p
                  className={`mt-1 text-sm ${
                    task.is_complete ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {task.description}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${priorityColors[task.priority]}`}
                >
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>

                {task.due_date && (
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'
                    }`}
                  >
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(task.due_date)}</span>
                    {isOverdue && (
                      <span className="ml-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Overdue
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleDelete}
              disabled={isDeleting || isToggling}
              className="rounded p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              aria-label="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
