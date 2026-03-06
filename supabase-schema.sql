-- ============================================
-- PHASE 2: Database Schema & RLS Setup
-- Task Manager Challenge - Supabase SQL Script
-- ============================================
-- Run this entire script in your Supabase SQL Editor
-- (Dashboard > SQL Editor > New Query)

-- ============================================
-- 1. Create the 'tasks' table
-- ============================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  is_complete BOOLEAN DEFAULT false NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'normal', 'high')) DEFAULT 'normal' NOT NULL,
  due_date DATE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);

-- Create an index on is_complete for filtering completed tasks
CREATE INDEX IF NOT EXISTS idx_tasks_is_complete ON public.tasks(is_complete);

-- Create an index on due_date for sorting/filtering by due date
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- ============================================
-- 2. Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. RLS Policies
-- ============================================

-- Policy: Users can SELECT only their own tasks
CREATE POLICY "Users can view their own tasks"
  ON public.tasks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can INSERT only their own tasks
CREATE POLICY "Users can insert their own tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can UPDATE only their own tasks
CREATE POLICY "Users can update their own tasks"
  ON public.tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can DELETE only their own tasks
CREATE POLICY "Users can delete their own tasks"
  ON public.tasks
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. Optional: Create a function to automatically update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- Script Complete!
-- ============================================
-- After running this script:
-- 1. Verify the table was created: Check Tables section in Supabase Dashboard
-- 2. Verify RLS is enabled: Check the "RLS enabled" toggle on the tasks table
-- 3. Verify policies exist: Check the "Policies" tab for the tasks table
-- ============================================
