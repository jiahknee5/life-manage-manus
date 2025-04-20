-- Database schema for Life Manage application

-- User settings table to store OpenAI API keys and preferences
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  openai_key TEXT,
  has_openai_key BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table to store categorized conversations
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'work' or 'personal'
  tags TEXT[], -- Array of tags
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'archived'
  priority INTEGER DEFAULT 0, -- Higher number means higher priority
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table to store uploaded ChatGPT conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- Store the entire conversation JSON
  conversation_id TEXT UNIQUE, -- Original ChatGPT conversation ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table to store AI-generated next steps
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table for user notes on projects
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies

-- User settings policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_settings_select ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_settings_insert ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_settings_update ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Projects policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY projects_select ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY projects_insert ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY projects_update ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY projects_delete ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Conversations policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY conversations_select ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY conversations_insert ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY conversations_update ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY conversations_delete ON conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY tasks_select ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY tasks_insert ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY tasks_update ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY tasks_delete ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Notes policies
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY notes_select ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY notes_insert ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY notes_update ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY notes_delete ON notes
  FOR DELETE USING (auth.uid() = user_id);
