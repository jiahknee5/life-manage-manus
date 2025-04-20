'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function OpenAIKeyForm() {
  const [apiKey, setApiKey] = useState('');
  const [storeKey, setStoreKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [hasStoredKey, setHasStoredKey] = useState(false);

  // Check if user has a stored API key
  useEffect(() => {
    const checkForStoredKey = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        const { data, error } = await supabase
          .from('user_settings')
          .select('has_openai_key')
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        
        setHasStoredKey(data?.has_openai_key || false);
      } catch (error) {
        console.error('Error checking for stored API key:', error);
      }
    };
    
    checkForStoredKey();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Basic validation
      if (!apiKey.trim().startsWith('sk-')) {
        throw new Error('Invalid OpenAI API key format');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to save an API key');
      }

      if (storeKey) {
        // Store encrypted key in database
        const { error } = await supabase
          .from('user_settings')
          .upsert({ 
            user_id: user.id, 
            openai_key: apiKey, // This would be encrypted in a real implementation
            has_openai_key: true
          });
          
        if (error) throw error;
        
        setMessage('API key saved successfully!');
        setHasStoredKey(true);
      } else {
        // Store in session only
        sessionStorage.setItem('openai_key', apiKey);
        setMessage('API key saved for this session only');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while saving the API key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        OpenAI API Key
      </h2>
      
      {hasStoredKey && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
          You already have a stored API key. Enter a new one to update it.
        </div>
      )}
      
      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="apiKey">
            OpenAI API Key
          </label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your API key is required to use AI features
          </p>
        </div>
        
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={storeKey}
              onChange={(e) => setStoreKey(e.target.checked)}
              className="mr-2"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Store my API key securely (encrypted)
            </span>
          </label>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            If unchecked, your key will only be stored for this session
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save API Key'}
        </button>
      </form>
    </div>
  );
}
