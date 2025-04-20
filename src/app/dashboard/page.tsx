'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { DatabaseService, Project, Task } from '@/lib/database';
import Link from 'next/link';

// Helper function to call OpenAI API for generating executive summary
async function generateExecutiveSummary(projects: Project[], tasks: Task[], apiKey: string) {
  const messages = [
    {
      role: 'system',
      content: `You are an AI assistant that helps users manage their projects.
      Based on the user's projects and tasks, generate a personalized executive summary.
      The summary should include:
      1. A brief overview of their current workload
      2. Prioritized action items
      3. A thoughtful reflection question to help them think about their work
      Keep the tone professional but friendly. Limit to 3-4 paragraphs.`
    },
    {
      role: 'user',
      content: `Generate an executive summary based on these projects and tasks:
      
      Projects: ${JSON.stringify(projects)}
      
      Tasks: ${JSON.stringify(tasks)}`
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
      throw new Error(data.error?.message || 'Failed to generate executive summary');
    }

    return data.choices[0]?.message?.content;
  } catch (error) {
    console.error('Error generating executive summary:', error);
    // Default summary if API call fails
    return `
      Welcome to your Life Manage dashboard. You currently have ${projects.length} active projects and ${tasks.length} pending tasks.
      
      Focus on completing your highest priority tasks first, especially those related to work projects with upcoming deadlines.
      
      Take a moment to reflect: Are your current projects aligned with your long-term goals? Consider reviewing your project list and adjusting priorities accordingly.
    `;
  }
}

export default function Dashboard() {
  const { user, openAIKey } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch projects
        const fetchedProjects = await DatabaseService.getProjects(user.id);
        setProjects(fetchedProjects);
        
        // Fetch all tasks
        const fetchedTasks = await DatabaseService.getTasks(user.id);
        setTasks(fetchedTasks);
        
        // Generate executive summary if we have OpenAI key
        if (openAIKey && fetchedProjects.length > 0) {
          setIsGenerating(true);
          const executiveSummary = await generateExecutiveSummary(
            fetchedProjects, 
            fetchedTasks,
            openAIKey
          );
          setSummary(executiveSummary);
          setIsGenerating(false);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, openAIKey]);

  // Get high priority tasks (pending or in progress)
  const priorityTasks = tasks
    .filter(task => task.status !== 'completed')
    .sort((a, b) => {
      // Sort by due date if available
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      
      // Otherwise sort by creation date
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 5); // Get top 5

  // Get recent projects
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3); // Get top 3

  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Dashboard
      </h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Executive Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Executive Summary
              </h2>
              
              {isGenerating ? (
                <div className="flex justify-center my-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : summary ? (
                <div className="prose dark:prose-invert max-w-none">
                  {summary.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 dark:text-gray-300">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300">
                  Welcome to Life Manage! Start by uploading your ChatGPT conversations and creating projects.
                </p>
              )}
              
              <div className="mt-6 flex space-x-4">
                <Link
                  href="/upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Upload History
                </Link>
                <Link
                  href="/projects"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Projects
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Overview
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Projects</p>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{projects.length}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">Tasks</p>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-200">{tasks.length}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Work</p>
                  <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                    {projects.filter(p => p.category === 'work').length}
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Personal</p>
                  <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                    {projects.filter(p => p.category === 'personal').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Priority Tasks */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Priority Tasks
                </h2>
                <Link
                  href="/next-steps"
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View All
                </Link>
              </div>
              
              {priorityTasks.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No tasks found. Generate some next steps!
                </p>
              ) : (
                <div className="space-y-3">
                  {priorityTasks.map(task => (
                    <div 
                      key={task.id}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 w-3 h-3 mt-1.5 rounded-full mr-3 ${
                          task.status === 'in_progress' 
                            ? 'bg-blue-500' 
                            : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <h3 className="text-md font-medium text-gray-900 dark:text-white">
                            {task.title}
                          </h3>
                          {task.due_date && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Recent Projects */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Projects
                </h2>
                <Link
                  href="/projects"
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View All
                </Link>
              </div>
              
              {recentProjects.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No projects found. Upload and categorize some conversations!
                </p>
              ) : (
                <div className="space-y-3">
                  {recentProjects.map(project => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
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
                        {project.tags.slice(0, 3).map((tag, index) => (
                          <span 
                            key={index} 
                            className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{project.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
