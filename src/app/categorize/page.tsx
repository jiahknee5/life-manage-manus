'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { DatabaseService, Conversation, Project } from '@/lib/database';

// Helper function to call OpenAI API for categorization
async function categorizeConversation(conversation: any, apiKey: string) {
  const messages = [
    {
      role: 'system',
      content: `You are an AI assistant that categorizes conversations. 
      Analyze the conversation and categorize it as either "work" or "personal".
      Also suggest up to 5 relevant tags based on the content.
      Return your response as a JSON object with "category" and "tags" fields.`
    },
    {
      role: 'user',
      content: `Categorize this conversation: ${JSON.stringify(conversation)}`
    }
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.3
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to categorize conversation');
    }

    const content = data.choices[0]?.message?.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Error categorizing conversation:', error);
    // Default categorization if API call fails
    return { category: 'personal', tags: ['uncategorized'] };
  }
}

export default function ProjectCategorizationPage() {
  const { user, openAIKey } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch uncategorized conversations (those without a project_id)
        const fetchedConversations = await DatabaseService.getConversations(user.id);
        const uncategorizedConversations = fetchedConversations.filter(conv => !conv.project_id);
        setConversations(uncategorizedConversations);
        
        // Fetch existing projects
        const fetchedProjects = await DatabaseService.getProjects(user.id);
        setProjects(fetchedProjects);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const categorizeConversations = async () => {
    if (!user || !openAIKey) {
      setError('User authentication or OpenAI API key is missing');
      return;
    }
    
    if (conversations.length === 0) {
      setError('No conversations to categorize');
      return;
    }
    
    setIsCategorizing(true);
    setError(null);
    setSuccess(null);
    setProgress(0);
    
    try {
      const categorizedProjects: Record<string, Project> = {};
      
      // Process each conversation
      for (let i = 0; i < conversations.length; i++) {
        const conversation = conversations[i];
        
        // Call OpenAI API to categorize the conversation
        const { category, tags } = await categorizeConversation(conversation.content, openAIKey);
        
        // Generate a project title based on conversation title
        const projectTitle = conversation.title || 'Untitled Project';
        
        // Check if we already created a similar project in this batch
        const projectKey = `${category}-${projectTitle}`;
        let projectId: string;
        
        if (categorizedProjects[projectKey]) {
          // Use existing project
          projectId = categorizedProjects[projectKey].id;
        } else {
          // Create a new project
          const newProject = await DatabaseService.createProject({
            user_id: user.id,
            title: projectTitle,
            description: `Automatically categorized from conversation: ${conversation.title}`,
            category: category as 'work' | 'personal',
            tags: tags || [],
            status: 'active',
            priority: 0
          });
          
          categorizedProjects[projectKey] = newProject;
          projectId = newProject.id;
          
          // Add to local projects state
          setProjects(prev => [...prev, newProject]);
        }
        
        // Update the conversation with the project_id
        await DatabaseService.updateConversation(conversation.id, { project_id: projectId });
        
        // Update progress
        setProgress(Math.round(((i + 1) / conversations.length) * 100));
      }
      
      setSuccess(`Successfully categorized ${conversations.length} conversations into ${Object.keys(categorizedProjects).length} projects`);
      
      // Clear the conversations list after categorization
      setConversations([]);
    } catch (err: any) {
      setError(err.message || 'Failed to categorize conversations');
    } finally {
      setIsCategorizing(false);
    }
  };

  const manuallyAssignProject = async (conversationId: string, projectId: string) => {
    if (!user) return;
    
    try {
      await DatabaseService.updateConversation(conversationId, { project_id: projectId });
      
      // Update local state
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      setSuccess('Conversation assigned to project successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to assign conversation to project');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Project Categorization
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
      
      {conversations.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-700 dark:text-gray-300">
            No uncategorized conversations found. Upload some conversations first.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Uncategorized Conversations ({conversations.length})
                </h2>
                <button
                  onClick={categorizeConversations}
                  disabled={isCategorizing}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isCategorizing ? 'Categorizing...' : 'Auto-Categorize All'}
                </button>
              </div>
              
              {isCategorizing && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-right">
                    {progress}% Complete
                  </p>
                </div>
              )}
              
              <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                {conversations.map(conv => (
                  <div 
                    key={conv.id}
                    className="p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {conv.title || 'Untitled Conversation'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(conv.created_at).toLocaleString()}
                        </p>
                      </div>
                      
                      <select
                        onChange={(e) => manuallyAssignProject(conv.id, e.target.value)}
                        className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        defaultValue=""
                      >
                        <option value="" disabled>Assign to Project</option>
                        {projects.map(project => (
                          <option key={project.id} value={project.id}>
                            {project.title} ({project.category})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Existing Projects ({projects.length})
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map(project => (
                  <div 
                    key={project.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-md font-medium text-gray-900 dark:text-white">
                        {project.title}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        project.category === 'work' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                      }`}>
                        {project.category}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
