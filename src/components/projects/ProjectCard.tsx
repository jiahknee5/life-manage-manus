'use client';

import { useState } from 'react';
import { Project } from '@/lib/database';

type ProjectCardProps = {
  project: Project;
  onSelect: (projectId: string) => void;
};

export default function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const getCategoryColor = (category: string) => {
    return category === 'work' 
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'archived':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
        isHovered ? 'shadow-lg transform -translate-y-1' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(project.id)}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {project.title}
          </h3>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getCategoryColor(project.category)}`}>
            {project.category}
          </span>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {project.description || 'No description provided'}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {project.tags.map((tag, index) => (
            <span 
              key={index} 
              className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Updated: {new Date(project.updated_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
