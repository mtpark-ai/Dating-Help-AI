-- Dating Help AI Modular Architecture Database Migration
-- Version: 1.0.0
-- Date: 2025-08-31
-- Description: Implement modular architecture database schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (be careful in production)
-- DROP TABLE IF EXISTS public.user_feedback CASCADE;
-- DROP TABLE IF EXISTS public.screenshot_analyses CASCADE;
-- DROP TABLE IF EXISTS public.pickup_line_generations CASCADE;
-- DROP TABLE IF EXISTS public.conversations CASCADE;
-- DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    preferences JSONB DEFAULT '{
        "defaultTone": "casual",
        "preferredLanguage": "en",
        "contentFiltering": true,
        "analyticsOptIn": true
    }'::jsonb,
    usage_stats JSONB DEFAULT '{
        "totalConversations": 0,
        "totalPickupLines": 0,
        "totalScreenshots": 0,
        "dailyUsage": 0,
        "lastResetDate": null,
        "tierLevel": "free"
    }'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    messages JSONB NOT NULL,
    context JSONB DEFAULT '{}'::jsonb,
    generated_replies TEXT[] NOT NULL,
    selected_reply TEXT,
    tone TEXT NOT NULL CHECK (tone IN ('flirty', 'funny', 'casual')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pickup line generations table
CREATE TABLE IF NOT EXISTS public.pickup_line_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    generated_lines TEXT[] NOT NULL,
    selected_line TEXT,
    tone TEXT NOT NULL CHECK (tone IN ('flirty', 'funny', 'casual', 'clever')),
    category TEXT NOT NULL CHECK (category IN ('opener', 'icebreaker', 'compliment', 'question', 'custom')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Screenshot analyses table
CREATE TABLE IF NOT EXISTS public.screenshot_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    extracted_conversation JSONB NOT NULL,
    analysis JSONB DEFAULT '{}'::jsonb,
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    error_message TEXT
);

-- User feedback table
CREATE TABLE IF NOT EXISTS public.user_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    related_entity_type TEXT NOT NULL CHECK (related_entity_type IN ('conversation', 'pickupLine', 'screenshot', 'general')),
    related_entity_id UUID,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('quality', 'accuracy', 'helpfulness', 'appropriateness', 'bug_report')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id_created ON public.conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_pickup_generations_user_id ON public.pickup_line_generations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_screenshot_analyses_user_id ON public.screenshot_analyses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_feedback_entity ON public.user_feedback(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_active ON public.user_profiles(last_active_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_line_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screenshot_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;

DROP POLICY IF EXISTS "Users can view own pickup lines" ON public.pickup_line_generations;
DROP POLICY IF EXISTS "Users can create own pickup lines" ON public.pickup_line_generations;
DROP POLICY IF EXISTS "Users can update own pickup lines" ON public.pickup_line_generations;

DROP POLICY IF EXISTS "Users can view own screenshot analyses" ON public.screenshot_analyses;
DROP POLICY IF EXISTS "Users can create own screenshot analyses" ON public.screenshot_analyses;

DROP POLICY IF EXISTS "Users can view own feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Users can create own feedback" ON public.user_feedback;

-- Create RLS Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.conversations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own pickup lines" ON public.pickup_line_generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own pickup lines" ON public.pickup_line_generations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pickup lines" ON public.pickup_line_generations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own screenshot analyses" ON public.screenshot_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own screenshot analyses" ON public.screenshot_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback" ON public.user_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own feedback" ON public.user_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for conversations table
DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON public.conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migration completion log
INSERT INTO public.user_feedback (
    user_id, 
    related_entity_type, 
    rating, 
    feedback, 
    feedback_type,
    metadata
) VALUES (
    '00000000-0000-0000-0000-000000000000'::UUID,
    'general',
    5,
    'Modular architecture database migration completed successfully',
    'quality',
    '{"migration": "001_modular_architecture_schema", "version": "1.0.0", "timestamp": "2025-08-31"}'::JSONB
) ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;