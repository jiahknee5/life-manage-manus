'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DatabaseService, Project, Conversation, Task, Note } from '@/lib/database';
import ConversationList from '@/components/conversations/ConversationList';
import TaskItem from '@/components/tasks/TaskItem';
import Link from 'next/link';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!user || !id) return;
      
      try {
        // Fetch project details
        const projectData = await DatabaseService.getProject(id as string);
        setProject(projectData);
        
        // Fetch related conversations
        const conversationsData = await DatabaseService.getConversations(user.id, id as string);
        setConversations(conversationsData);
        
        // Fetch tasks
        const tasksData = await DatabaseService.getTasks(user.id, id as string);
        setTasks(tasksData);
        
        // Fetch notes
        const notesData = await DatabaseService.getNotes(user.id, id as string);
        setNotes(notesData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch project data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjectData();
  }, [user, id]);

  const handleConversationSelect = async (conversationId: string) => {
    try {
      const conversation = await DatabaseService.getConversation(conversationId);
      setSelectedConversation(conversation);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch conversation details');
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    if (!user) return;
    
    try {
      await DatabaseService.updateTask(taskId, { status: newStatus });
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      
      setSuccess('Task status updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update task status');
    }
  };

  const handleAddNote = async () => {
    if (!user || !project || !newNote.trim()) return;
    
    try {
      const note = await DatabaseService.createNote({
        user_id: user.id,
        project_id: project.id,
        content: newNote.trim()
      });
      
      // Update local state
      setNotes(prev => [note, ...prev]);
      setNewNote('');
      
      setSuccess('Note added successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to add note');
    }
  };

  const handleUpdateProject = async (updates: Partial<Project>) => {
    if (!user || !project) return;
    
    try {
      const updatedProject = await DatabaseService.updateProject(project.id, updates);
      setProject(updatedProject);
      
      setSuccess('Project updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update project');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Project Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The project you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link
          href="/projects"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
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
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {project.title}
              </h1>
              <div className="flex items-center mt-2 space-x-2">
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                  project.category === 'work' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                }`}>
                  {project.category}
                </span>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                  project.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : project.status === 'completed'
                      ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                }`}>
                  {project.status}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleUpdateProject({ 
                  status: project.status === 'active' ? 'completed' : 'active' 
                })}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  project.status === 'active'
                    ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300'
                }`}
              >
                {project.status === 'active' ? 'Mark Completed' : 'Reactivate'}
              </button>
              <button
                onClick={() => handleUpdateProject({ 
                  status: project.status === 'archived' ? 'active' : 'archived' 
                })}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  project.status === 'archived'
                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300'
                }`}
              >
                {project.status === 'archived' ? 'Unarchive' : 'Archive'}
              </button>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {project.description || 'No description provided'}
          </p>
          
          <div className="flex flex-wrap gap-1 mb-4">
            {project.tags.map((tag, index) => (
              <span 
                key={index} 
                className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
            <span>Updated: {new Date(project.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Conversations */}
        <div>
          <ConversationList 
            conversations={conversations}
            onSelect={handleConversationSelect}
            selectedId={selectedConversation?.id}
          />
          
          {selectedConversation && (
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Conversation Details
                </h2>
              </div>
              <div className="p-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                  {selectedConversation.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Created: {new Date(selectedConversation.created_at).toLocaleString()}
                </p>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900 max-h-96 overflow-y-auto">
                  <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {JSON.stringify(selectedConversation.content, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Middle Column - Tasks */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tasks
              </h2>
              <Link
                href={`/next-steps?project=${project.id}`}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Generate Next Steps
              </Link>
            </div>
            <div className="p-4">
              {tasks.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">
                  No tasks found for this project
                </p>
              ) : (
                <div className="space-y-3">
                  {tasks.map(task => (
                    <TaskItem 
                      key={task.id}
                      task={task}
                      onStatusChange={handleTaskStatusChange}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Column - Notes */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notes
              </h2>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                ></textarea>
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Add Note
                </button>
              </div>
              
              {notes.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">
                  No notes found for this project
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notes.map(note => (
                    <div 
                      key={note.id}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {new Date(note.created_at).toLocaleString()}
                      </p>
                    </div>
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
