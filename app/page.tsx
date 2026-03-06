'use client';

import { useState } from 'react';
import { useAnonymousAuth } from '@/components/auth/AnonymousAuthProvider';
import { CreateTaskForm } from '@/components/tasks/CreateTaskForm';
import { TaskList } from '@/components/tasks/TaskList';
import { useToast } from '@/components/ui/Toast';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { session, isLoading: authLoading, authError } = useAnonymousAuth();
  const { showToast, ToastContainer } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTaskCreated = () => {
    showToast('Task created successfully!', 'success');
    // Trigger refresh of task list
    setRefreshKey((prev) => prev + 1);
  };

  const handleError = (error: string) => {
    showToast(error, 'error');
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-800 font-medium">Authentication Error</p>
          <p className="mt-2 text-sm text-red-600">{authError}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-3 text-gray-600">Setting up your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
          <p className="mt-2 text-gray-600">Organize your tasks and stay productive</p>
        </header>

        {/* Create Task Form */}
        <div className="mb-8">
          <CreateTaskForm onTaskCreated={handleTaskCreated} onError={handleError} />
        </div>

        {/* Task List */}
        <div>
          <TaskList onError={handleError} refreshKey={refreshKey} />
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
