'use client';

import { ReactNode, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading, openAIKey } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      // User is not logged in, redirect to login page
      redirect('/login');
    } else if (!isLoading && user && !openAIKey) {
      // User is logged in but doesn't have API key, redirect to login page
      redirect('/login');
    }
  }, [isLoading, user, openAIKey]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}
