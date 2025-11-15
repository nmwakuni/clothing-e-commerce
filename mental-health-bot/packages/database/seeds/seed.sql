-- Nafsi Mental Health Platform - Seed Data
-- Created: 2025-01-15

-- Insert sample resources
INSERT INTO resources (title, type, category, content, estimated_time, difficulty, is_published) VALUES
  ('Understanding Anxiety: A Guide for Kenyans', 'article', 'anxiety', 'Learn about anxiety symptoms and coping strategies tailored to African contexts.', 10, 'beginner', TRUE),
  ('5-Minute Breathing Exercise', 'breathing_exercise', 'stress', 'Quick breathing technique to calm your mind and reduce stress.', 5, 'beginner', TRUE),
  ('Guided Meditation for Sleep', 'meditation', 'self_care', 'Relax your body and mind with this soothing meditation.', 15, 'beginner', TRUE),
  ('Dealing with Depression in African Communities', 'article', 'depression', 'Understanding depression and navigating cultural stigma.', 12, 'intermediate', TRUE),
  ('Managing Relationship Stress', 'article', 'relationships', 'Healthy communication and conflict resolution strategies.', 8, 'beginner', TRUE),
  ('Trauma Recovery Toolkit', 'worksheet', 'trauma', 'Evidence-based exercises for processing traumatic experiences.', 20, 'intermediate', TRUE),
  ('Body Scan Meditation', 'meditation', 'self_care', 'Progressive relaxation technique for stress relief.', 10, 'beginner', TRUE),
  ('Crisis Hotlines Kenya', 'hotline', 'crisis', 'Emergency mental health support numbers available 24/7.', NULL, NULL, TRUE),
  ('Mindfulness for Anxiety', 'video', 'anxiety', 'Learn mindfulness techniques to manage anxiety symptoms.', 15, 'beginner', TRUE),
  ('Self-Compassion Practice', 'worksheet', 'self_care', 'Develop kindness towards yourself during difficult times.', 10, 'beginner', TRUE);

-- Insert sample therapist specializations
-- Note: Actual therapist accounts would be created through the registration process
-- This is just metadata for demonstration

-- Insert sample support group topics
-- Groups would typically be created by users, but we can seed some examples
INSERT INTO support_groups (name, description, topic, is_private, is_active, current_members, max_members) VALUES
  ('Anxiety Warriors', 'A supportive community for individuals dealing with anxiety. Share coping strategies and support each other.', 'anxiety', FALSE, TRUE, 0, 30),
  ('Depression Support Circle', 'A safe space to discuss depression, share experiences, and find hope together.', 'depression', FALSE, TRUE, 0, 25),
  ('Young Professionals Mental Health', 'Navigate work stress, career pressure, and maintain mental wellness in your professional journey.', 'general', FALSE, TRUE, 0, 40),
  ('Grief & Loss Support', 'Find comfort and understanding while navigating grief. Honor your loved ones and heal together.', 'grief', FALSE, TRUE, 0, 20),
  ('LGBTQ+ Mental Wellness', 'Affirming space for LGBTQ+ individuals to discuss mental health, identity, and community.', 'lgbtq', TRUE, TRUE, 0, 20),
  ('Parents Mental Health Circle', 'Supporting parents through the joys and challenges of raising children while caring for your mental health.', 'parenting', FALSE, TRUE, 0, 30);

-- Add system-level crisis resources
-- These would be accessible to all users

COMMIT;
