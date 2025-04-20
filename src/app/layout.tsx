'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppLayout>
            <ProtectedRoute>
              {children}
            </ProtectedRoute>
          </AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
