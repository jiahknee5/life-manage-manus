'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { DatabaseService } from '@/lib/database';
import FileUpload from '@/components/upload/FileUpload';

type ChatGPTConversation = {
  id: string;
  title: string;
  create_time: number;
  update_time: number;
  mapping: Record<string, any>;
  selected?: boolean;
};

export default function UploadPage() {
  const { user, openAIKey } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [conversations, setConversations] = useState<ChatGPTConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setSuccess(null);
    setConversations([]);
    
    if (!selectedFile.name.endsWith('.json')) {
      setError('Please upload a valid ChatGPT export file (.json)');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const fileContent = await selectedFile.text();
      const data = JSON.parse(fileContent);
      
      if (!data.conversations || !Array.isArray(data.conversations)) {
        throw new Error('Invalid ChatGPT export format');
      }
      
      // Extract conversations and add selected property
      const extractedConversations = data.conversations.map((conv: any) => ({
        ...conv,
        selected: true
      }));
      
      setConversations(extractedConversations);
    } catch (err: any) {
      setError(err.message || 'Failed to parse the uploaded file');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleConversationSelection = (id: string) => {
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === id ? { ...conv, selected: !conv.selected } : conv
      )
    );
  };

  const selectAll = (selected: boolean) => {
    setConversations(prevConversations => 
      prevConversations.map(conv => ({ ...conv, selected }))
    );
  };

  const processConversations = async () => {
    if (!user) {
      setError('You must be logged in to process conversations');
      return;
    }
    
    if (!openAIKey) {
      setError('OpenAI API key is required to process conversations');
      return;
    }
    
    const selectedConversations = conversations.filter(conv => conv.selected);
    
    if (selectedConversations.length === 0) {
      setError('Please select at least one conversation to process');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Process each selected conversation
      for (const conv of selectedConversations) {
        // Create a conversation record in the database
        await DatabaseService.createConversation({
          user_id: user.id,
          project_id: null, // Will be assigned later during categorization
          title: conv.title || 'Untitled Conversation',
          content: conv, // Store the entire conversation JSON
          conversation_id: conv.id
        });
      }
      
      setSuccess(`Successfully processed ${selectedConversations.length} conversations`);
      
      // Clear the form after successful processing
      setFile(null);
      setConversations([]);
    } catch (err: any) {
      setError(err.message || 'Failed to process conversations');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Upload ChatGPT History
      </h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          {success}
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Step 1: Upload your ChatGPT export file
          </h2>
          <FileUpload onFileSelect={handleFileSelect} />
        </div>
      </div>
      
      {isLoading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {conversations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Step 2: Select conversations to process
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => selectAll(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Select All
                </button>
                <button
                  onClick={() => selectAll(false)}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Deselect All
                </button>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              {conversations.map(conv => (
                <div 
                  key={conv.id}
                  className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={conv.selected}
                    onChange={() => toggleConversationSelection(conv.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {conv.title || 'Untitled Conversation'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(conv.create_time * 1000).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <button
                onClick={processConversations}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Process Selected Conversations'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
