export interface Domain {
  id: string
  section_number: number
  section_name: string
  domain_number: number
  domain_name: string
  description: string | null
  sort_order: number
  created_at: string
}

export interface Cluster {
  id: string
  domain_id: string
  cluster_number: number
  cluster_name: string
  description: string | null
  sort_order: number
}

export interface Competency {
  id: string
  cluster_id: string
  competency_number: number
  description: string
  proficiency_tier: number
  cognitive_verb: string
  sort_order: number
}

export interface Question {
  id: string
  competency_id: string
  question_type: 'mcq' | 'scenario' | 'ranking' | 'open'
  question_text: string
  options: Record<string, unknown> | null
  correct_answer: Record<string, unknown> | null
  difficulty_weight: number
  metadata: Record<string, unknown>
  is_active: boolean
  created_at: string
}

export interface AssessmentSession {
  id: string
  user_id: string | null
  session_token: string
  status: 'in_progress' | 'completed' | 'expired'
  started_at: string
  completed_at: string | null
  expires_at: string
  total_questions: number
  metadata: Record<string, unknown>
}

export interface Response {
  id: string
  session_id: string
  question_id: string
  answer: Record<string, unknown>
  is_correct: boolean | null
  time_taken_seconds: number | null
  answered_at: string
}

export interface CompetencyProfile {
  id: string
  session_id: string
  user_id: string | null
  overall_tier: number
  domain_scores: Record<string, unknown>
  cluster_scores: Record<string, unknown>
  strengths: unknown[]
  blind_spots: unknown[]
  recommendations: unknown[]
  generated_at: string
}

export interface PlaygroundSession {
  id: string
  user_id: string
  playground_type: string
  competency_focus: string[]
  progress: Record<string, unknown>
  started_at: string
  last_active_at: string
}

export interface UserProfile {
  id: string
  display_name: string | null
  role: 'individual' | 'team_admin' | 'team_member' | null
  organization: string | null
  subscription_tier: 'free' | 'pro' | 'team'
  created_at: string
  updated_at: string
}
