import { supabase } from '@/lib/supabase';

// Type definitions for ChatGPT conversation content
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatConversationContent {
  id: string;
  title: string;
  create_time: number;
  update_time: number;
  mapping: Record<string, { id: string; role: string; content: string }>;
}

// Type definitions for database tables
export type UserSettings = {
  id: string;
  user_id: string;
  openai_key: string | null;
  has_openai_key: boolean;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: 'work' | 'personal';
  tags: string[];
  status: 'active' | 'completed' | 'archived';
  priority: number;
  created_at: string;
  updated_at: string;
};

export type Conversation = {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  content: ChatConversationContent; // JSONB content from ChatGPT
  conversation_id: string;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Note = {
  id: string;
  user_id: string;
  project_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

// Database service functions
export const DatabaseService = {
  // User Settings
  getUserSettings: async (userId: string): Promise<UserSettings> => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) throw error;
    return data as UserSettings;
  },
  
  upsertUserSettings: async (settings: Partial<UserSettings> & { user_id: string }): Promise<UserSettings> => {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert(settings)
      .select()
      .single();
      
    if (error) throw error;
    return data as UserSettings;
  },
  
  // Projects
  getProjects: async (userId: string): Promise<Project[]> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('priority', { ascending: false })
      .order('updated_at', { ascending: false });
      
    if (error) throw error;
    return data as Project[];
  },
  
  getProject: async (projectId: string): Promise<Project> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
      
    if (error) throw error;
    return data as Project;
  },
  
  createProject: async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> => {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
      
    if (error) throw error;
    return data as Project;
  },
  
  updateProject: async (projectId: string, updates: Partial<Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Project> => {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();
      
    if (error) throw error;
    return data as Project;
  },
  
  deleteProject: async (projectId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
      
    if (error) throw error;
    return true;
  },
  
  // Conversations
  getConversations: async (userId: string, projectId?: string): Promise<Conversation[]> => {
    let query = supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId);
      
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query.order('updated_at', { ascending: false });
      
    if (error) throw error;
    return data as Conversation[];
  },
  
  getConversation: async (conversationId: string): Promise<Conversation> => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
      
    if (error) throw error;
    return data as Conversation;
  },
  
  createConversation: async (conversation: Omit<Conversation, 'id' | 'created_at' | 'updated_at'>): Promise<Conversation> => {
    const { data, error } = await supabase
      .from('conversations')
      .insert(conversation)
      .select()
      .single();
      
    if (error) throw error;
    return data as Conversation;
  },
  
  updateConversation: async (conversationId: string, updates: Partial<Omit<Conversation, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Conversation> => {
    const { data, error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', conversationId)
      .select()
      .single();
      
    if (error) throw error;
    return data as Conversation;
  },
  
  // Tasks
  getTasks: async (userId: string, projectId?: string): Promise<Task[]> => {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);
      
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query.order('due_date', { ascending: true });
      
    if (error) throw error;
    return data as Task[];
  },
  
  createTask: async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> => {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();
      
    if (error) throw error;
    return data as Task;
  },
  
  updateTask: async (taskId: string, updates: Partial<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Task> => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();
      
    if (error) throw error;
    return data as Task;
  },
  
  // Notes
  getNotes: async (userId: string, projectId: string): Promise<Note[]> => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data as Note[];
  },
  
  createNote: async (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> => {
    const { data, error } = await supabase
      .from('notes')
      .insert(note)
      .select()
      .single();
      
    if (error) throw error;
    return data as Note;
  },
  
  updateNote: async (noteId: string, content: string): Promise<Note> => {
    const { data, error } = await supabase
      .from('notes')
      .update({ content })
      .eq('id', noteId)
      .select()
      .single();
      
    if (error) throw error;
    return data as Note;
  },
  
  deleteNote: async (noteId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);
      
    if (error) throw error;
    return true;
  }
};
