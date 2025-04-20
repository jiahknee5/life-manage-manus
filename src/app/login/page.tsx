'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import AuthForm from '@/components/auth/AuthForm';
import OpenAIKeyForm from '@/components/auth/OpenAIKeyForm';

export default function LoginPage() {
  const { user, isLoading, openAIKey } = useAuth();
  const router = useRouter();
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  
  useEffect(() => {
    if (!isLoading && user && openAIKey) {
      // User is logged in and has API key, redirect to dashboard
      router.push('/dashboard');
    } else if (!isLoading && user && !openAIKey) {
      // User is logged in but needs API key
      setShowApiKeyForm(true);
    }
  }, [isLoading, user, openAIKey, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md mb-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-2">
          Life Manage
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Organize your ChatGPT conversations into actionable projects
        </p>
      </div>
      
      {showApiKeyForm ? <OpenAIKeyForm /> : <AuthForm />}
    </div>
  );
}
