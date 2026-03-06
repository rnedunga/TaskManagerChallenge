'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getTasks } from '@/app/actions/tasks';
import { TaskItem } from './TaskItem';
import type { Task } from '@/lib/types/task';

interface TaskListProps {
  onError?: (error: string) => void;
  refreshKey?: number;
}

export function TaskList({ onError, refreshKey }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    setIsLoading(true);
    const result = await getTasks();
    setIsLoading(false);

    if (result.error) {
      onError?.(result.error);
    } else {
      setTasks(result.data || []);
    }
  };

  useEffect(() => {
    void fetchTasks();
  }, [refreshKey]);

  const handleTaskUpdate = () => {
    void fetchTasks();
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-gray-200 bg-gray-100 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded border border-gray-300 bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <p className="text-gray-500">No tasks yet. Create your first task to get started!</p>
      </div>
    );
  }

  const completedTasks = tasks.filter((task) => task.is_complete);
  const activeTasks = tasks.filter((task) => !task.is_complete);

  return (
    <div className="space-y-6">
      {activeTasks.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            Active Tasks ({activeTasks.length})
          </h2>
          <div className="space-y-3">
            {activeTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={handleTaskUpdate}
                onError={onError}
              />
            ))}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-500">
            Completed ({completedTasks.length})
          </h2>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={handleTaskUpdate}
                onError={onError}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
