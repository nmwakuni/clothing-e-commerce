-- Nafsi Mental Health Platform - Initial Schema
-- Created: 2025-01-15

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  phone_number TEXT UNIQUE,
  name TEXT,

  -- Privacy & Anonymity
  is_anonymous BOOLEAN DEFAULT TRUE,
  display_name TEXT,

  -- Mental Health Profile
  primary_concerns TEXT[],
  triggers TEXT[],
  coping_strategies TEXT[],

  -- Risk Assessment
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  last_risk_assessment TIMESTAMP,
  has_safety_plan BOOLEAN DEFAULT FALSE,

  -- Preferences
  preferences JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Therapists Table
CREATE TABLE IF NOT EXISTS therapists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Credentials
  license_number TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,

  -- Profile
  bio TEXT,
  specializations TEXT[],
  years_of_experience INTEGER,
  education TEXT[],
  languages TEXT[],

  -- Availability
  session_rate DECIMAL(10, 2),
  accepting_clients BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES therapists(id),

  -- Session Details
  session_type TEXT NOT NULL CHECK (session_type IN ('ai', 'human_video', 'human_chat')),
  messages JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),

  -- AI Analysis
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'crisis')),
  crisis_detected BOOLEAN DEFAULT FALSE,
  crisis_level TEXT DEFAULT 'none' CHECK (crisis_level IN ('none', 'mild', 'moderate', 'severe', 'critical')),

  -- Timestamps
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Moods Table
CREATE TABLE IF NOT EXISTS moods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Mood Data
  mood_level INTEGER NOT NULL CHECK (mood_level BETWEEN 1 AND 10),
  mood_type TEXT NOT NULL CHECK (mood_type IN ('happy', 'sad', 'anxious', 'angry', 'calm', 'stressed', 'excited', 'lonely', 'overwhelmed', 'grateful')),
  note TEXT,

  -- Context
  activities TEXT[],
  triggers TEXT[],
  symptoms TEXT[],

  -- Timestamp
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Journal Entries Table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  title TEXT,
  content TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('happy', 'sad', 'anxious', 'angry', 'calm', 'stressed', 'excited', 'lonely', 'overwhelmed', 'grateful')),
  is_private BOOLEAN DEFAULT TRUE,
  tags TEXT[],

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crisis Events Table
CREATE TABLE IF NOT EXISTS crisis_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Crisis Details
  crisis_type TEXT NOT NULL CHECK (crisis_type IN ('suicidal_ideation', 'self_harm', 'panic_attack', 'severe_distress', 'psychotic_episode')),
  severity TEXT NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe', 'critical')),
  trigger_message TEXT,

  -- Detection
  detected_by TEXT NOT NULL CHECK (detected_by IN ('ai', 'user_reported', 'therapist', 'emergency_contact')),

  -- Intervention
  intervention_type TEXT[],
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  resolution_notes TEXT,

  -- Location
  location TEXT,
  contacted_emergency_services BOOLEAN DEFAULT FALSE,

  -- Timestamps
  occurred_at TIMESTAMP DEFAULT NOW()
);

-- Safety Plans Table
CREATE TABLE IF NOT EXISTS safety_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,

  -- Plan Details
  warning_signs TEXT[],
  coping_strategies TEXT[],
  distractions TEXT[],
  support_contacts JSONB DEFAULT '[]',
  professional_contacts JSONB DEFAULT '[]',
  safe_environment TEXT[],
  reasons_to_live TEXT[],

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,

  -- Appointment Details
  scheduled_for TIMESTAMP NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('video', 'chat', 'phone')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),

  -- Notes
  notes TEXT,
  session_summary TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  cancellation_reason TEXT,

  -- Timestamps
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Resources Table
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Resource Details
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('article', 'video', 'podcast', 'worksheet', 'meditation', 'breathing_exercise', 'hotline')),
  category TEXT NOT NULL CHECK (category IN ('anxiety', 'depression', 'stress', 'trauma', 'relationships', 'self_care', 'crisis')),
  content TEXT NOT NULL,
  url TEXT,

  -- Metadata
  estimated_time INTEGER,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  is_published BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Support Groups Table
CREATE TABLE IF NOT EXISTS support_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Group Details
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  topic TEXT NOT NULL CHECK (topic IN ('anxiety', 'depression', 'trauma', 'grief', 'addiction', 'relationships', 'parenting', 'lgbtq', 'general')),

  -- Moderation
  moderator_id UUID REFERENCES users(id),
  is_private BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Membership
  current_members INTEGER DEFAULT 0,
  max_members INTEGER DEFAULT 20,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Group Members Table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES support_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  role TEXT DEFAULT 'member' CHECK (role IN ('moderator', 'member')),
  joined_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(group_id, user_id)
);

-- Group Messages Table
CREATE TABLE IF NOT EXISTS group_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES support_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,

  posted_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_moods_user_id ON moods(user_id);
CREATE INDEX IF NOT EXISTS idx_moods_recorded_at ON moods(recorded_at);
CREATE INDEX IF NOT EXISTS idx_crisis_events_user_id ON crisis_events(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_therapist_id ON appointments(therapist_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);
