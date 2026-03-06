'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type AnonymousAuthContextValue = {
  supabase: SupabaseClient;
  session: Session | null;
  isLoading: boolean;
  authError: string | null;
};

const AnonymousAuthContext = createContext<AnonymousAuthContextValue | undefined>(undefined);

type AnonymousAuthProviderProps = {
  children: ReactNode;
};

/**
 * Provider that ensures there is always an authenticated Supabase session.
 * On first load, if no session exists, it signs the user in anonymously.
 * The session is then persisted by Supabase via local storage + cookies.
 */
export function AnonymousAuthProvider({ children }: AnonymousAuthProviderProps) {
  const [supabase] = useState<SupabaseClient>(() => createSupabaseBrowserClient());
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      setIsLoading(true);
      setAuthError(null);

      // 1. Check if there's already an active session
      const {
        data: { session: existingSession },
        error: getSessionError,
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (getSessionError) {
        setAuthError(getSessionError.message);
        setIsLoading(false);
        return;
      }

      if (existingSession) {
        setSession(existingSession);
        setIsLoading(false);
        return;
      }

      // 2. If no session, sign in anonymously
      const {
        data: { session: newSession },
        error: signInError,
      } = await supabase.auth.signInAnonymously();

      if (!isMounted) return;

      if (signInError) {
        setAuthError(signInError.message);
      } else {
        setSession(newSession);
      }

      setIsLoading(false);
    };

    void initAuth();

    // 3. Subscribe to auth state changes to keep session in sync
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription?.subscription.unsubscribe();
    };
  }, [supabase]);

  const value: AnonymousAuthContextValue = {
    supabase,
    session,
    isLoading,
    authError,
  };

  return (
    <AnonymousAuthContext.Provider value={value}>
      {children}
    </AnonymousAuthContext.Provider>
  );
}

export function useAnonymousAuth(): AnonymousAuthContextValue {
  const context = useContext(AnonymousAuthContext);

  if (!context) {
    throw new Error('useAnonymousAuth must be used within an AnonymousAuthProvider');
  }

  return context;
}

