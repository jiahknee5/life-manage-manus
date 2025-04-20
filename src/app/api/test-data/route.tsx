'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { DatabaseService } from '@/lib/database';
import { sampleProjects, sampleTasks, sampleConversations, sampleNotes } from '@/app/api/test-data';

export async function GET() {
  return new Response(JSON.stringify({ message: 'Test data API endpoint' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export default function TestDataPage() {
  const { user } = useAuth();
  
  const loadTestData = async () => {
    if (!user) {
      return { success: false, message: 'User not authenticated' };
    }
    
    try {
      // Create sample projects
      const projects = [];
      for (const projectData of sampleProjects) {
        const project = await DatabaseService.createProject({
          user_id: user.id,
          title: projectData.title!,
          description: projectData.description,
          category: projectData.category as 'work' | 'personal',
          tags: projectData.tags || [],
          status: projectData.status as 'active' | 'completed' | 'archived',
          priority: projectData.priority || 0
        });
        projects.push(project);
      }
      
      // Create sample tasks for each project
      for (let i = 0; i < sampleTasks.length; i++) {
        const projectIndex = i % projects.length;
        await DatabaseService.createTask({
          user_id: user.id,
          project_id: projects[projectIndex].id,
          title: sampleTasks[i].title!,
          description: sampleTasks[i].description,
          status: sampleTasks[i].status as 'pending' | 'in_progress' | 'completed',
          due_date: sampleTasks[i].due_date
        });
      }
      
      // Create sample conversations for each project
      for (let i = 0; i < sampleConversations.length; i++) {
        const projectIndex = i % projects.length;
        await DatabaseService.createConversation({
          user_id: user.id,
          project_id: projects[projectIndex].id,
          title: sampleConversations[i].title!,
          content: sampleConversations[i].content!,
          conversation_id: sampleConversations[i].conversation_id!
        });
      }
      
      // Create sample notes for each project
      for (let i = 0; i < sampleNotes.length; i++) {
        const projectIndex = i % projects.length;
        await DatabaseService.createNote({
          user_id: user.id,
          project_id: projects[projectIndex].id,
          content: sampleNotes[i].content!
        });
      }
      
      return { success: true, message: 'Test data loaded successfully' };
    } catch (error: any) {
      console.error('Error loading test data:', error);
      return { success: false, message: error.message || 'Failed to load test data' };
    }
  };
  
  useEffect(() => {
    // This is just for demonstration - in a real app, you'd want a button to trigger this
    // loadTestData();
  }, []);
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Test Data Loader
      </h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          This page allows you to load sample test data into your account for testing purposes.
          This includes sample projects, tasks, conversations, and notes.
        </p>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-6">
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            Warning: This will add test data to your account. Use this only for testing purposes.
          </p>
        </div>
        
        <button
          onClick={loadTestData}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Load Test Data
        </button>
      </div>
    </div>
  );
}
