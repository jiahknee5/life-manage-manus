// Test data for the Life Manage application

import { Project, Task, Conversation, Note } from '@/lib/database';

// Sample projects
export const sampleProjects: Partial<Project>[] = [
  {
    title: 'Website Redesign',
    description: 'Redesign the company website with modern UI and improved UX',
    category: 'work',
    tags: ['design', 'frontend', 'ui/ux'],
    status: 'active',
    priority: 2
  },
  {
    title: 'Vacation Planning',
    description: 'Plan summer vacation to Europe including flights, accommodations, and activities',
    category: 'personal',
    tags: ['travel', 'planning', 'budget'],
    status: 'active',
    priority: 1
  },
  {
    title: 'Learn Machine Learning',
    description: 'Study machine learning concepts and complete online course',
    category: 'personal',
    tags: ['education', 'ai', 'programming'],
    status: 'active',
    priority: 0
  }
];

// Sample tasks
export const sampleTasks: Partial<Task>[] = [
  {
    title: 'Create wireframes for homepage',
    description: 'Design wireframes for the new homepage layout',
    status: 'in_progress',
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
  },
  {
    title: 'Research flight options',
    description: 'Compare prices and schedules for flights to major European cities',
    status: 'pending',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
  },
  {
    title: 'Complete first module of ML course',
    description: 'Watch videos and complete exercises for the introduction module',
    status: 'completed',
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  }
];

// Sample conversations
export const sampleConversations: Partial<Conversation>[] = [
  {
    title: 'Website Design Ideas',
    content: {
      id: 'conv_123',
      title: 'Website Design Ideas',
      create_time: Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60, // 7 days ago
      update_time: Math.floor(Date.now() / 1000) - 5 * 24 * 60 * 60, // 5 days ago
      mapping: {
        message_1: {
          id: 'msg_1',
          role: 'user',
          content: 'I need ideas for a modern website design for a tech company.'
        },
        message_2: {
          id: 'msg_2',
          role: 'assistant',
          content: 'For a modern tech company website, consider these design elements:\n\n1. Minimalist design with ample white space\n2. Bold typography and vibrant accent colors\n3. Subtle animations and micro-interactions\n4. Dark mode option\n5. Card-based UI components\n\nWould you like me to elaborate on any of these?'
        }
      }
    },
    conversation_id: 'conv_123'
  },
  {
    title: 'Europe Travel Planning',
    content: {
      id: 'conv_456',
      title: 'Europe Travel Planning',
      create_time: Math.floor(Date.now() / 1000) - 14 * 24 * 60 * 60, // 14 days ago
      update_time: Math.floor(Date.now() / 1000) - 10 * 24 * 60 * 60, // 10 days ago
      mapping: {
        message_1: {
          id: 'msg_1',
          role: 'user',
          content: 'I\'m planning a trip to Europe this summer. What are some must-visit destinations?'
        },
        message_2: {
          id: 'msg_2',
          role: 'assistant',
          content: 'For a summer trip to Europe, here are some must-visit destinations:\n\n1. Paris, France - The Eiffel Tower, Louvre, and charming streets\n2. Rome, Italy - Colosseum, Vatican, and amazing cuisine\n3. Barcelona, Spain - Sagrada Familia, beaches, and vibrant culture\n4. Amsterdam, Netherlands - Canals, museums, and bicycle-friendly city\n5. Santorini, Greece - Stunning views, white buildings, and Mediterranean atmosphere\n\nWould you like more specific recommendations for any of these places?'
        }
      }
    },
    conversation_id: 'conv_456'
  }
];

// Sample notes
export const sampleNotes: Partial<Note>[] = [
  {
    content: 'Need to schedule a meeting with the design team to discuss wireframes',
  },
  {
    content: 'Check if travel insurance covers medical emergencies in all EU countries',
  },
  {
    content: 'Found a great online course on Coursera for machine learning fundamentals',
  }
];
