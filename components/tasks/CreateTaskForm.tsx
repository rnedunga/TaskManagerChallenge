'use client';

import { useState, type FormEvent } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { createTask } from '@/app/actions/tasks';
import type { TaskPriority } from '@/lib/types/task';

interface CreateTaskFormProps {
  onTaskCreated?: () => void;
  onError?: (error: string) => void;
}

export function CreateTaskForm({ onTaskCreated, onError }: CreateTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal' as TaskPriority,
    due_date: '',
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.title.trim()) {
      onError?.('Task title is required');
      setIsSubmitting(false);
      return;
    }

    const result = await createTask({
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      priority: formData.priority,
      due_date: formData.due_date || null,
    });

    setIsSubmitting(false);

    if (result.error) {
      onError?.(result.error);
    } else {
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'normal',
        due_date: '',
      });
      setIsOpen(false);
      onTaskCreated?.();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
      >
        <Plus className="h-5 w-5" />
        <span>Add Task</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-4">
        <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Enter task title"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Enter task description (optional)"
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="priority" className="mb-2 block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value as TaskPriority })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label htmlFor="due_date" className="mb-2 block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            id="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              <span>Create Task</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setFormData({
              title: '',
              description: '',
              priority: 'normal',
              due_date: '',
            });
          }}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
