# 📊 Database Schema - LMS Platform

Complete PostgreSQL database schema for SkillHub Africa LMS.

## 🗂️ Schema Overview

```
Core Learning System
├── users
├── courses
├── lessons
├── enrollments
├── progress
├── assessments
├── submissions
└── certificates

AI & Interactions
├── conversations
├── messages
├── ai_sessions
└── feedback

Marketplace
├── creators
├── course_reviews
├── payouts
└── transactions

Enterprise
├── organizations
├── teams
├── team_members
└── learning_paths
```

---

## 📋 Detailed Schema

### 1. Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  phone_number VARCHAR(20) UNIQUE NOT NULL,  -- Primary identifier (WhatsApp)
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,

  -- Preferences
  language VARCHAR(10) DEFAULT 'en',  -- en, sw (Swahili)
  timezone VARCHAR(50) DEFAULT 'Africa/Nairobi',
  learning_style VARCHAR(20),  -- visual, auditory, kinesthetic

  -- Account Status
  role VARCHAR(20) DEFAULT 'student',  -- student, creator, admin
  subscription_tier VARCHAR(20) DEFAULT 'free',  -- free, premium, premium_plus
  subscription_expires_at TIMESTAMPTZ,

  -- Gamification
  xp_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,

  -- Settings
  whatsapp_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT false,
  sms_notifications BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,

  -- Constraints
  CHECK (role IN ('student', 'creator', 'admin')),
  CHECK (subscription_tier IN ('free', 'premium', 'premium_plus'))
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

---

### 2. Courses Table

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(500),

  -- Content
  thumbnail_url TEXT,
  preview_video_url TEXT,
  language VARCHAR(10) DEFAULT 'en',
  difficulty VARCHAR(20) DEFAULT 'beginner',  -- beginner, intermediate, advanced

  -- Creator
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Categorization
  category VARCHAR(100),  -- programming, design, business, vocational, etc.
  tags TEXT[],  -- array of tags

  -- Pricing
  price_kes INTEGER DEFAULT 0,  -- 0 = free
  is_premium_only BOOLEAN DEFAULT false,

  -- Stats
  total_lessons INTEGER DEFAULT 0,
  estimated_hours DECIMAL(5,2),
  enrollment_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,

  -- Learning Outcomes
  learning_outcomes TEXT[],  -- What students will learn
  prerequisites TEXT[],  -- What students need to know

  -- Status
  status VARCHAR(20) DEFAULT 'draft',  -- draft, published, archived
  published_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  CHECK (status IN ('draft', 'published', 'archived')),
  CHECK (price_kes >= 0)
);

CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_creator ON courses(creator_id);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_published ON courses(published_at) WHERE status = 'published';
```

---

### 3. Lessons Table

```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,

  -- Content
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,

  -- Lesson Content
  content_type VARCHAR(20) NOT NULL,  -- video, text, interactive, quiz, project
  content_data JSONB,  -- Flexible content storage
  /*
    For video: { url, duration, subtitles }
    For text: { markdown, reading_time }
    For interactive: { exercise_type, code_template, tests }
    For quiz: { questions: [...] }
    For project: { brief, requirements, rubric }
  */

  -- Resources
  attachments JSONB,  -- PDFs, code files, etc.
  external_resources JSONB,  -- Links to docs, tutorials

  -- Ordering
  section_name VARCHAR(100),
  order_index INTEGER NOT NULL,

  -- Completion Criteria
  estimated_minutes INTEGER,
  passing_score INTEGER,  -- For quizzes/assessments
  requires_submission BOOLEAN DEFAULT false,

  -- AI Tutor
  ai_enabled BOOLEAN DEFAULT true,
  ai_context TEXT,  -- Context for AI tutor about this lesson

  -- Status
  is_preview BOOLEAN DEFAULT false,  -- Can be viewed without enrollment
  is_published BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(course_id, slug),
  CHECK (content_type IN ('video', 'text', 'interactive', 'quiz', 'project'))
);

CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_lessons_order ON lessons(course_id, order_index);
```

---

### 4. Enrollments Table

```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,

  -- Enrollment Info
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  source VARCHAR(50),  -- whatsapp, web, mobile, referral, etc.

  -- Progress
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  current_lesson_id UUID REFERENCES lessons(id),

  -- Completion
  completed_at TIMESTAMPTZ,
  certificate_id UUID REFERENCES certificates(id),
  final_score DECIMAL(5,2),

  -- Payment
  payment_type VARCHAR(20),  -- free, one_time, subscription
  amount_paid_kes INTEGER DEFAULT 0,
  transaction_id UUID REFERENCES transactions(id),

  -- Learning
  time_spent_minutes INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,

  -- Status
  status VARCHAR(20) DEFAULT 'active',  -- active, paused, completed, dropped

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, course_id),
  CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  CHECK (status IN ('active', 'paused', 'completed', 'dropped'))
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
```

---

### 5. Progress Table

```sql
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,

  -- Progress
  status VARCHAR(20) DEFAULT 'not_started',  -- not_started, in_progress, completed
  progress_percentage DECIMAL(5,2) DEFAULT 0,

  -- Completion
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent_minutes INTEGER DEFAULT 0,

  -- Assessment
  score DECIMAL(5,2),
  attempts INTEGER DEFAULT 0,
  passed BOOLEAN,

  -- Engagement
  notes TEXT,  -- Student notes
  bookmarked BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, lesson_id),
  CHECK (status IN ('not_started', 'in_progress', 'completed')),
  CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
);

CREATE INDEX idx_progress_user ON progress(user_id);
CREATE INDEX idx_progress_lesson ON progress(lesson_id);
CREATE INDEX idx_progress_enrollment ON progress(enrollment_id);
```

---

### 6. Assessments Table

```sql
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,

  -- Assessment Info
  title VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL,  -- quiz, coding_challenge, project, essay

  -- Configuration
  questions JSONB NOT NULL,
  /*
    [
      {
        id: "q1",
        type: "multiple_choice",
        question: "What is...",
        options: ["A", "B", "C", "D"],
        correct_answer: "B",
        explanation: "Because...",
        points: 10
      },
      {
        id: "q2",
        type: "code",
        question: "Write a function that...",
        starter_code: "def solve():",
        test_cases: [...],
        points: 20
      }
    ]
  */

  -- Settings
  time_limit_minutes INTEGER,
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  randomize_questions BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CHECK (type IN ('quiz', 'coding_challenge', 'project', 'essay'))
);

CREATE INDEX idx_assessments_lesson ON assessments(lesson_id);
```

---

### 7. Submissions Table

```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,

  -- Submission
  answers JSONB NOT NULL,  -- Student's answers
  submitted_at TIMESTAMPTZ DEFAULT NOW(),

  -- Grading
  score DECIMAL(5,2),
  max_score DECIMAL(5,2),
  percentage DECIMAL(5,2),
  passed BOOLEAN,
  graded_at TIMESTAMPTZ,
  graded_by UUID REFERENCES users(id),  -- NULL for auto-graded

  -- Feedback
  feedback JSONB,  -- Per-question feedback
  ai_feedback TEXT,  -- AI-generated feedback
  instructor_feedback TEXT,

  -- Attempts
  attempt_number INTEGER NOT NULL,
  time_taken_minutes INTEGER,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_assessment ON submissions(assessment_id);
```

---

### 8. Certificates Table

```sql
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,

  -- Certificate Info
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),

  -- Verification
  blockchain_hash VARCHAR(255),  -- For verification
  verification_url TEXT,

  -- Performance
  final_score DECIMAL(5,2),
  completion_time_days INTEGER,

  -- Shareable
  public_url TEXT,
  is_public BOOLEAN DEFAULT true,

  -- Metadata
  metadata JSONB,  -- Skills earned, projects completed, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_course ON certificates(course_id);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);
```

---

### 9. Conversations Table (WhatsApp)

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- WhatsApp Info
  whatsapp_conversation_id VARCHAR(255) UNIQUE,
  phone_number VARCHAR(20) NOT NULL,

  -- Context
  current_context VARCHAR(50),  -- browsing, learning, support, onboarding
  context_data JSONB,  -- Current course, lesson, etc.

  -- Status
  status VARCHAR(20) DEFAULT 'active',  -- active, inactive, blocked

  -- Metadata
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CHECK (status IN ('active', 'inactive', 'blocked'))
);

CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_whatsapp ON conversations(whatsapp_conversation_id);
```

---

### 10. Messages Table

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Message Info
  direction VARCHAR(10) NOT NULL,  -- inbound, outbound
  content_type VARCHAR(20) NOT NULL,  -- text, image, video, audio, document

  -- Content
  content TEXT,
  media_url TEXT,
  media_mime_type VARCHAR(100),

  -- WhatsApp
  whatsapp_message_id VARCHAR(255),
  whatsapp_status VARCHAR(20),  -- sent, delivered, read, failed

  -- AI
  is_ai_generated BOOLEAN DEFAULT false,
  ai_model VARCHAR(50),  -- claude-3-sonnet, gpt-4, etc.

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CHECK (direction IN ('inbound', 'outbound')),
  CHECK (content_type IN ('text', 'image', 'video', 'audio', 'document'))
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
```

---

### 11. AI Sessions Table

```sql
CREATE TABLE ai_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,

  -- Session Info
  session_type VARCHAR(50),  -- tutoring, assessment_help, general_question
  topic VARCHAR(255),

  -- AI Model
  model VARCHAR(50),  -- claude-3-sonnet-20240229
  total_tokens INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6) DEFAULT 0,

  -- Effectiveness
  helpful_rating INTEGER,  -- 1-5
  student_feedback TEXT,

  -- Metadata
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER
);

CREATE INDEX idx_ai_sessions_user ON ai_sessions(user_id);
CREATE INDEX idx_ai_sessions_lesson ON ai_sessions(lesson_id);
```

---

### 12. Transactions Table

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Transaction Info
  type VARCHAR(50) NOT NULL,  -- course_purchase, subscription, payout
  amount_kes INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'KES',

  -- Payment Provider
  provider VARCHAR(50),  -- mpesa, card, bank
  provider_transaction_id VARCHAR(255),
  provider_reference VARCHAR(255),

  -- M-Pesa Specific
  mpesa_receipt_number VARCHAR(50),
  phone_number VARCHAR(20),

  -- Status
  status VARCHAR(20) DEFAULT 'pending',  -- pending, completed, failed, refunded

  -- Related Entities
  course_id UUID REFERENCES courses(id),
  subscription_id UUID,

  -- Metadata
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Constraints
  CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  CHECK (amount_kes > 0)
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_provider_ref ON transactions(provider_reference);
```

---

### 13. Course Reviews Table

```sql
CREATE TABLE course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,

  -- Review
  rating INTEGER NOT NULL,  -- 1-5
  review_text TEXT,

  -- Helpful
  helpful_count INTEGER DEFAULT 0,

  -- Status
  is_verified_purchase BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, course_id),
  CHECK (rating >= 1 AND rating <= 5)
);

CREATE INDEX idx_reviews_course ON course_reviews(course_id);
CREATE INDEX idx_reviews_rating ON course_reviews(rating);
```

---

### 14. Organizations Table (B2B)

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url TEXT,

  -- Contact
  admin_user_id UUID REFERENCES users(id),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),

  -- Subscription
  plan VARCHAR(50) DEFAULT 'starter',  -- starter, growth, enterprise
  max_seats INTEGER,
  seats_used INTEGER DEFAULT 0,

  -- Billing
  billing_email VARCHAR(255),
  billing_address JSONB,

  -- Customization
  custom_domain VARCHAR(255),
  brand_colors JSONB,
  white_label_enabled BOOLEAN DEFAULT false,

  -- Status
  status VARCHAR(20) DEFAULT 'active',  -- active, suspended, cancelled

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CHECK (plan IN ('starter', 'growth', 'enterprise')),
  CHECK (status IN ('active', 'suspended', 'cancelled'))
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
```

---

## 🔄 Relationships Summary

```
users (1) ──< (M) enrollments (M) >── (1) courses
users (1) ──< (M) progress (M) >── (1) lessons
users (1) ──< (M) submissions (M) >── (1) assessments
users (1) ──< (M) certificates (M) >── (1) courses
users (1) ──< (M) conversations ──< messages
courses (1) ──< (M) lessons ──< (1) assessments
```

---

## 📈 Indexes Strategy

### High-Traffic Queries
- User lookups by phone (WhatsApp)
- Course browsing by category/status
- Enrollment progress checks
- Message history retrieval

### Composite Indexes
```sql
CREATE INDEX idx_enrollments_user_status ON enrollments(user_id, status);
CREATE INDEX idx_progress_user_lesson ON progress(user_id, lesson_id);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
```

---

## 🔐 Security Considerations

1. **Row-Level Security (RLS)**
   - Users can only see their own data
   - Creators can only edit their courses
   - Admins have full access

2. **Encrypted Fields**
   - Payment information
   - Personal identifiable information (PII)

3. **Audit Logs**
   - Track all modifications to critical tables
   - Separate audit table for compliance

---

## 🚀 Performance Optimization

1. **Partitioning**
   - Partition `messages` by month
   - Partition `progress` by user_id range

2. **Materialized Views**
   ```sql
   CREATE MATERIALIZED VIEW course_stats AS
   SELECT
     c.id,
     COUNT(DISTINCT e.user_id) as enrollment_count,
     AVG(cr.rating) as avg_rating,
     COUNT(DISTINCT cr.id) as review_count
   FROM courses c
   LEFT JOIN enrollments e ON e.course_id = c.id
   LEFT JOIN course_reviews cr ON cr.course_id = c.id
   GROUP BY c.id;
   ```

3. **Caching Strategy**
   - Cache course catalog (Redis, 1 hour TTL)
   - Cache user profile (Redis, 15 min TTL)
   - Cache leaderboards (Redis, 5 min TTL)

---

This schema supports:
- ✅ 1M+ users
- ✅ 10K+ courses
- ✅ 100M+ messages
- ✅ Real-time analytics
- ✅ WhatsApp integration
- ✅ B2B features
- ✅ AI tutoring
- ✅ Payments & payouts
