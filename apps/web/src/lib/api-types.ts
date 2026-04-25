/** DTOs aligned with PRIME backend (flexible for evolving schemas). */

export type ApiRole = string;

export type AuthUserDto = {
  id: string;
  name?: string;
  full_name?: string;
  email: string;
  role: ApiRole;
  school_id?: string | null;
  schoolId?: string | null;
};

export type LoginResponse = {
  access_token?: string;
  token?: string;
  token_type?: string;
};

export type RegisterResponse = {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
};

export type SubjectDto = {
  id: string;
  name: string;
  code?: string;
};

export type UnitDto = {
  id: string;
  name: string;
  order?: number;
};

export type SubtopicDto = {
  id: string;
  name: string;
  order?: number;
};

export type SessionMaterialDto = string;

export type SessionUnitDto = {
  id?: string;
  title?: string;
  unit_number?: number;
};

export type TeachingNoteSummaryDto = {
  id: string;
  teaching_note_id?: string;
  generation_status?: string;
};

export type TeachingNoteDto = {
  id: string;
  teaching_note_id?: string;
  session_id?: string;
  lesson_plan_id?: string;
  generation_status?: string;
  teacher_intro_script?: string | null;
  stepwise_explanation?: string | null;
  worked_examples?: string | null;
  teacher_questions?: string | null;
  student_activity_guidance?: string | null;
  real_life_application?: string | null;
  struggling_student_support?: string | null;
  average_student_support?: string | null;
  advanced_student_extension?: string | null;
  common_mistakes?: string | null;
  lesson_wrap_up?: string | null;
};

export type SessionProgressDto = {
  id?: string;
  progress_id?: string;
  completion_status?: string;
  delivery_confidence?: string | null;
  deviation_reason?: string | null;
  follow_up_required?: boolean;
};

export type SessionDto = {
  id: string;
  session_number?: number;
  sessionNumber?: number;
  title: string;
  unit_name?: string;
  unit?: string | SessionUnitDto | null;
  subtopic_name?: string;
  subtopic?: string | { name?: string } | null;
  planned_date?: string;
  plannedDate?: string;
  status: string;
  materials_required?: SessionMaterialDto[];
  materials?: SessionMaterialDto[];
  lesson_plan?: LessonPlanDto | null;
  teaching_note?: TeachingNoteSummaryDto | null;
  learning_goal_summary?: string | null;
  session_type?: string;
  progress?: SessionProgressDto | null;
};

export type LessonPlanSection = {
  title?: string;
  content?: string;
  items?: string[];
};

export type LessonPlanDto = {
  id?: string;
  objectives?: string[] | string;
  prior_knowledge?: string[] | string;
  opening?: string;
  delivery_steps?: string[] | string;
  guided_practice?: string;
  independent_practice?: string;
  classwork?: string;
  homework?: string;
  materials?: string[] | string;
  sections?: LessonPlanSection[];
  raw?: Record<string, unknown>;
};

export type GenerationJobDto = {
  id?: string;
  job_id?: string;
  status: string;
  progress?: number;
  message?: string;
  result?: Record<string, unknown>;
};

export type CalendarGeneratePayload = {
  subject_id: string;
  sequencing_mode: "textbook_order" | "optimized";
  total_sessions: number;
  academic_year_start: string;
  academic_year_end?: string;
};

export type LessonPlanGeneratePayload = {
  session_id: string;
};

export type TeachingNoteGeneratePayload = {
  session_id: string;
};

export type AssessmentGeneratePayload = {
  session_id: string;
  assessment_type?: string;
};

export type AssessmentDto = {
  id: string;
  assessment_id?: string;
  session_id?: string;
  assessment_type?: string;
  subject_id?: string;
  unit_id?: string;
  subtopic_id?: string | null;
  question_set?: string | null;
  answer_key?: string | null;
  marking_guide?: string | null;
  estimated_duration_minutes?: number | null;
  difficulty_level?: string;
  question_format_mix?: string[] | null;
  download_doc_url?: string | null;
  generated_at?: string | null;
};

export type ProgressUpdatePayload = {
  session_id: string;
  completion_status?: string;
  delivery_confidence?: string;
  deviation_reason?: string;
  notes?: string;
  follow_up_required?: boolean;
};

export type TeacherProgressDto = {
  today_count?: number;
  upcoming_count?: number;
  completed_count?: number;
  pending_count?: number;
  sessions?: SessionDto[];
};

export type DepartmentTeacherDto = {
  id: string;
  name: string;
  email?: string;
  planned?: number;
  delivered?: number;
  completion_rate?: number;
};

export type DepartmentProgressDto = {
  teachers?: DepartmentTeacherDto[];
  overdue_sessions?: { teacher: string; session: string; overdue_days?: number }[];
  pending_reviews?: number;
  completion_rate?: number;
};

export type SchoolDepartmentDto = {
  department: string;
  completion: number;
};

export type SchoolProgressDto = {
  total_teachers?: number;
  completion_rate?: number;
  avg_confidence?: number;
  departments?: SchoolDepartmentDto[];
  completion_trend?: number[];
  teachers_needing_support?: { name: string; reason: string }[];
};
