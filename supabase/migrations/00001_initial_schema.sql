-- Mekalin Visual Engine: Initial Schema
-- Generated: 2026-06-30

-- Competency Framework (Static/Admin-managed)
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_number INT NOT NULL,
  section_name TEXT NOT NULL,
  domain_number INT NOT NULL,
  domain_name TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES domains(id),
  cluster_number INT NOT NULL,
  cluster_name TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL
);

CREATE TABLE competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id UUID REFERENCES clusters(id),
  competency_number INT NOT NULL,
  description TEXT NOT NULL,
  proficiency_tier INT NOT NULL CHECK (proficiency_tier BETWEEN 1 AND 5),
  cognitive_verb TEXT NOT NULL,
  sort_order INT NOT NULL
);

-- Question Bank
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competency_id UUID REFERENCES competencies(id),
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'scenario', 'ranking', 'open')),
  question_text TEXT NOT NULL,
  options JSONB,
  correct_answer JSONB,
  difficulty_weight DECIMAL(3,2) DEFAULT 1.0,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Assessment Sessions
CREATE TABLE assessment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'expired')),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '72 hours'),
  total_questions INT DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES assessment_sessions(id),
  question_id UUID REFERENCES questions(id),
  answer JSONB NOT NULL,
  is_correct BOOLEAN,
  time_taken_seconds INT,
  answered_at TIMESTAMPTZ DEFAULT now()
);

-- Results & Profiles
CREATE TABLE competency_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES assessment_sessions(id),
  user_id UUID REFERENCES auth.users(id),
  overall_tier INT NOT NULL CHECK (overall_tier BETWEEN 1 AND 5),
  domain_scores JSONB NOT NULL,
  cluster_scores JSONB NOT NULL,
  strengths JSONB DEFAULT '[]',
  blind_spots JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  generated_at TIMESTAMPTZ DEFAULT now()
);

-- Practice Playground
CREATE TABLE playground_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  playground_type TEXT NOT NULL,
  competency_focus UUID[] DEFAULT '{}',
  progress JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT now(),
  last_active_at TIMESTAMPTZ DEFAULT now()
);

-- User Profiles (for registered users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  role TEXT CHECK (role IN ('individual', 'team_admin', 'team_member')),
  organization TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'team')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_questions_competency ON questions(competency_id) WHERE is_active = true;
CREATE INDEX idx_sessions_token ON assessment_sessions(session_token);
CREATE INDEX idx_sessions_user ON assessment_sessions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_responses_session ON responses(session_id);
CREATE INDEX idx_profiles_user ON competency_profiles(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_domains_sort ON domains(sort_order);

-- Row Level Security
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE competency_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE playground_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: domains, clusters, competencies (public read)
CREATE POLICY "Public read access" ON domains FOR SELECT USING (true);
CREATE POLICY "Public read access" ON clusters FOR SELECT USING (true);
CREATE POLICY "Public read access" ON competencies FOR SELECT USING (true);

-- RLS Policies: questions (service role only - no public policies)
-- Questions are served via Edge Functions using service_role key

-- RLS Policies: assessment_sessions
CREATE POLICY "Users can view own sessions" ON assessment_sessions
  FOR SELECT USING (
    auth.uid() = user_id OR
    session_token = current_setting('request.headers', true)::json->>'x-session-token'
  );
CREATE POLICY "Anyone can create sessions" ON assessment_sessions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Session owner can update" ON assessment_sessions
  FOR UPDATE USING (
    auth.uid() = user_id OR
    session_token = current_setting('request.headers', true)::json->>'x-session-token'
  );

-- RLS Policies: responses
CREATE POLICY "Session owner can insert responses" ON responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessment_sessions
      WHERE id = session_id AND (
        auth.uid() = user_id OR
        session_token = current_setting('request.headers', true)::json->>'x-session-token'
      )
    )
  );
CREATE POLICY "Session owner can view responses" ON responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessment_sessions
      WHERE id = session_id AND (
        auth.uid() = user_id OR
        session_token = current_setting('request.headers', true)::json->>'x-session-token'
      )
    )
  );

-- RLS Policies: competency_profiles
CREATE POLICY "Owner can view profiles" ON competency_profiles
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM assessment_sessions
      WHERE id = session_id AND
        session_token = current_setting('request.headers', true)::json->>'x-session-token'
    )
  );

-- RLS Policies: playground_sessions
CREATE POLICY "Users can manage own playground" ON playground_sessions
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies: user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
