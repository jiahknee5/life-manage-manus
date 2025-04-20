'use client';

import { useState } from 'react';
import { Task } from '@/lib/database';

type TaskItemProps = {
  task: Task;
  onStatusChange: (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => void;
};

export default function TaskItem({ task, onStatusChange }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-3">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-3">
            <button
              onClick={() => {
                const newStatus = task.status === 'completed' 
                  ? 'pending' 
                  : task.status === 'pending' 
                    ? 'in_progress' 
                    : 'completed';
                onStatusChange(task.id, newStatus);
              }}
              className={`flex-shrink-0 w-5 h-5 rounded-full border-2 ${
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
              {task.due_date && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getStatusColor(task.status)}`}>
              {task.status.replace('_', ' ')}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
                />
              </svg>
            </button>
          </div>
        </div>
        
        {isExpanded && task.description && (
          <div className="mt-3 pl-8 text-sm text-gray-600 dark:text-gray-400">
            {task.description}
          </div>
        )}
      </div>
    </div>
  );
}
