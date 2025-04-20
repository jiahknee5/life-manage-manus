'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  openAIKey: string | null;
  setOpenAIKey: (key: string, store: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openAIKey, setOpenAIKeyState] = useState<string | null>(null);

  useEffect(() => {
    // Try to get API key from session storage first
    const sessionKey = sessionStorage.getItem('openai_key');
    if (sessionKey) {
      setOpenAIKeyState(sessionKey);
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        // If user is logged in and we don't have a key from session storage,
        // try to get it from the database
        if (session?.user && !sessionKey) {
          try {
            const { data, error } = await supabase
              .from('user_settings')
              .select('openai_key')
              .eq('user_id', session.user.id)
              .single();

            if (!error && data?.openai_key) {
              setOpenAIKeyState(data.openai_key);
            }
          } catch (error) {
            console.error('Error fetching API key:', error);
          }
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('openai_key');
    setOpenAIKeyState(null);
  };

  const setOpenAIKey = async (key: string, store: boolean) => {
    setOpenAIKeyState(key);
    sessionStorage.setItem('openai_key', key);

    if (store && user) {
      try {
        await supabase
          .from('user_settings')
          .upsert({ 
            user_id: user.id, 
            openai_key: key,
            has_openai_key: true
          });
      } catch (error) {
        console.error('Error storing API key:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      signOut,
      openAIKey,
      setOpenAIKey
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
