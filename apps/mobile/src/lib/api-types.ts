export type UserRole = "teacher" | "department_head" | "school_leader" | "admin";

export type LoginResponse = {
  access_token?: string;
  token?: string;
  role?: UserRole;
  email?: string;
  name?: string;
};

export type LessonPlanDto = {
  id: string;
  objectives: string[];
  prior_knowledge: string[];
  opening: string;
  delivery_steps: string[];
  guided_practice: string;
  independent_practice: string;
  classwork: string;
  homework: string;
  materials: string[];
};

export type TeachingNoteDto = {
  id: string;
  session_id: string;
  teacher_intro_script: string;
  stepwise_explanation: string;
  worked_examples: string;
  teacher_questions: string;
};

export type AssessmentDto = {
  id: string;
  session_id: string;
  assessment_type: string;
  question_set: string;
  answer_key: string;
  marking_guide: string;
};

export type SessionDto = {
  id: string;
  session_number: number;
  title: string;
  planned_date: string;
  status: "planned" | "delivered" | "overdue";
  learning_goal_summary: string;
  unit_name: string;
  subtopic_name: string;
  confidence?: number;
};

export type TeacherProgressDto = {
  today_count: number;
  upcoming_count: number;
  completed_count: number;
  pending_count: number;
  sessions: SessionDto[];
};

export type DepartmentTeacherDto = {
  id: string;
  name: string;
  email: string;
  planned: number;
  delivered: number;
  completion_rate: number;
};

export type DepartmentProgressDto = {
  teachers: DepartmentTeacherDto[];
  completion_rate: number;
  pending_reviews: number;
};

export type SchoolProgressDto = {
  total_teachers: number;
  completion_rate: number;
  avg_confidence: number;
  departments: { department: string; completion: number }[];
  teachers_needing_support: { name: string; reason: string }[];
};
