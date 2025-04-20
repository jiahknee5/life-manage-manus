'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { DatabaseService, Project, Task, Conversation, ChatConversationContent } from '@/lib/database';

interface NextStep {
  title: string;
  description: string;
}

// Helper function to call OpenAI API for generating next steps
async function generateNextSteps(project: Project, conversations: Conversation[], apiKey: string): Promise<NextStep[]> {
  const messages = [
    {
      role: 'system',
      content: `You are an AI assistant that helps users manage their projects.
      Based on the project details and related conversations, generate 3-5 actionable next steps.
      Each next step should be specific, clear, and directly related to moving the project forward.
      Return your response as a JSON array of objects, each with "title" and "description" fields.`
    },
    {
      role: 'user',
      content: `Generate next steps for this project:
      
      Project Title: ${project.title}
      Project Category: ${project.category}
      Project Tags: ${project.tags.join(', ')}
      
      Related Conversations: ${JSON.stringify(conversations)}`
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
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate next steps');
    }

    const content = data.choices[0]?.message?.content;
    return JSON.parse(content) as NextStep[];
  } catch (error) {
    console.error('Error generating next steps:', error);
    // Default next steps if API call fails
    return [
      { 
        title: 'Review project details', 
        description: 'Take some time to review the project details and goals.' 
      },
      { 
        title: 'Identify key stakeholders', 
        description: 'Make a list of all the people involved in or affected by this project.' 
      },
      { 
        title: 'Set project milestones', 
        description: 'Define clear milestones to track progress on this project.' 
      }
    ];
  }
}

export default function NextStepsPage(): JSX.Element {
  const { user, openAIKey } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async (): Promise<void> => {
      if (!user) return;
      
      try {
        const fetchedProjects = await DatabaseService.getProjects(user.id);
        setProjects(fetchedProjects);
        
        if (fetchedProjects.length > 0) {
          setSelectedProject(fetchedProjects[0]);
          
          // Fetch tasks for the first project
          const fetchedTasks = await DatabaseService.getTasks(user.id, fetchedProjects[0].id);
          setTasks(fetchedTasks);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [user]);

  const handleProjectChange = async (projectId: string): Promise<void> => {
    if (!user) return;
    
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    setSelectedProject(project);
    setIsLoading(true);
    
    try {
      const fetchedTasks = await DatabaseService.getTasks(user.id, projectId);
      setTasks(fetchedTasks);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTasks = async (): Promise<void> => {
    if (!user || !openAIKey || !selectedProject) {
      setError('User authentication, OpenAI API key, or selected project is missing');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Fetch conversations related to this project
      const conversations = await DatabaseService.getConversations(user.id, selectedProject.id);
      
      // Generate next steps using OpenAI
      const nextSteps = await generateNextSteps(selectedProject, conversations, openAIKey);
      
      // Create tasks from the generated next steps
      for (const step of nextSteps) {
        await DatabaseService.createTask({
          user_id: user.id,
          project_id: selectedProject.id,
          title: step.title,
          description: step.description,
          status: 'pending',
          due_date: null
        });
      }
      
      // Refresh tasks
      const updatedTasks = await DatabaseService.getTasks(user.id, selectedProject.id);
      setTasks(updatedTasks);
      
      setSuccess(`Successfully generated ${nextSteps.length} next steps for "${selectedProject.title}"`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate next steps';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed'): Promise<void> => {
    if (!user) return;
    
    try {
      await DatabaseService.updateTask(taskId, { status: newStatus });
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task status';
      setError(errorMessage);
    }
  };

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        AI-Powered Next Steps
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
      
      {projects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-700 dark:text-gray-300">
            No projects found. Create or categorize some projects first.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Select Project
                </h2>
              </div>
              
              <select
                value={selectedProject?.id || ''}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title} ({project.category})
                  </option>
                ))}
              </select>
              
              {selectedProject && (
                <div className="mt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 dark:text-white">
                        {selectedProject.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedProject.description || 'No description provided'}
                      </p>
                    </div>
                    <button
                      onClick={generateTasks}
                      disabled={isGenerating}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isGenerating ? 'Generating...' : 'Generate Next Steps'}
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedProject.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Next Steps
              </h2>
              
              {isLoading ? (
                <div className="flex justify-center my-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">
                    No tasks found for this project. Generate some next steps!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map(task => (
                    <div 
                      key={task.id}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => {
                            const newStatus = task.status === 'completed' 
                              ? 'pending' 
                              : task.status === 'pending' 
                                ? 'in_progress' 
                                : 'completed';
                            updateTaskStatus(task.id, newStatus);
                          }}
                          className={`flex-shrink-0 w-5 h-5 mt-1 rounded-full border-2 ${
                            task.status === 'completed' 
                              ? 'bg-green-500 border-green-500' 
                              : task.status === 'in_progress'
                                ? 'bg-blue-500 border-blue-500'
                                : 'bg-white dark:bg-gray-700 border-gray-400 dark:border-gray-500'
                          }`}
                        >
                          {task.status === 'completed' && (
                            <svg className="w-full h-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <div>
                          <h3 
                            className={`text-md font-medium ${
                              task.status === 'completed' 
                                ? 'text-gray-500 dark:text-gray-400 line-through' 
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center mt-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                              task.status === 'completed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : task.status === 'in_progress'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            }`}>
                              {task.status.replace('_', ' ')}
                            </span>
                            {task.due_date && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                Due: {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
