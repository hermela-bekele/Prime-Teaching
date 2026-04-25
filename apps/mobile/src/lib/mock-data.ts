import { addDays } from "date-fns";

import type {
  AssessmentDto,
  DepartmentProgressDto,
  LessonPlanDto,
  SchoolProgressDto,
  SessionDto,
  TeacherProgressDto,
  TeachingNoteDto,
  UserRole
} from "@/lib/api-types";

const now = new Date();
const iso = (offset: number) => addDays(now, offset).toISOString();

export const mockUsers: Record<string, { password: string; role: UserRole; name: string }> = {
  "teacher@prime.edu": { password: "password123", role: "teacher", name: "Amina Yusuf" },
  "department@prime.edu": { password: "password123", role: "department_head", name: "David Okoro" },
  "leader@prime.edu": { password: "password123", role: "school_leader", name: "Grace Njeri" },
  "admin@prime.edu": { password: "password123", role: "admin", name: "PRIME Admin" }
};

export const mockSessions: SessionDto[] = [
  {
    id: "s1",
    session_number: 1,
    title: "Introduction to Relations and Functions",
    planned_date: iso(0),
    status: "delivered",
    learning_goal_summary: "Understand relations, domain/range, and what makes a relation a function.",
    unit_name: "Further on Relations and Functions",
    subtopic_name: "Revision on relations",
    confidence: 4
  },
  {
    id: "s2",
    session_number: 2,
    title: "Types of Functions",
    planned_date: iso(1),
    status: "planned",
    learning_goal_summary: "Explore linear, quadratic, polynomial, and rational function families.",
    unit_name: "Further on Relations and Functions",
    subtopic_name: "Additional types of functions"
  },
  {
    id: "s3",
    session_number: 3,
    title: "Classification of Functions",
    planned_date: iso(3),
    status: "planned",
    learning_goal_summary: "Classify functions as one-to-one, onto, and bijective using examples.",
    unit_name: "Further on Relations and Functions",
    subtopic_name: "Classification of functions"
  },
  {
    id: "s4",
    session_number: 4,
    title: "Composition of Functions",
    planned_date: iso(6),
    status: "planned",
    learning_goal_summary: "Apply function composition and interpret f(g(x)) versus g(f(x)).",
    unit_name: "Further on Relations and Functions",
    subtopic_name: "Composition of functions"
  },
  {
    id: "s5",
    session_number: 5,
    title: "Inverse Functions",
    planned_date: iso(8),
    status: "planned",
    learning_goal_summary: "Find inverse functions algebraically and connect to graph reflections.",
    unit_name: "Further on Relations and Functions",
    subtopic_name: "Inverse functions and graphs"
  },
  {
    id: "s6",
    session_number: 6,
    title: "Rational Expressions",
    planned_date: iso(12),
    status: "planned",
    learning_goal_summary: "Simplify and operate with rational expressions in algebraic contexts.",
    unit_name: "Rational Expressions and Rational Functions",
    subtopic_name: "Introduction to rational expressions"
  }
];

export const mockLessonPlan: LessonPlanDto = {
  id: "lp-1",
  objectives: ["Define a relation", "Test if relation is a function", "Evaluate f(x)"],
  prior_knowledge: ["Ordered pairs", "Basic substitution"],
  opening: "Use a vending-machine analogy: one input gives one output.",
  delivery_steps: [
    "Introduce relation with mapping diagrams.",
    "Extract domain and range from ordered pairs.",
    "Apply vertical line test.",
    "Practice function notation."
  ],
  guided_practice: "Classify five relation examples together.",
  independent_practice: "Solve mixed domain/range and notation questions.",
  classwork: "Worksheet sections A-C in pairs.",
  homework: "Textbook exercise on notation and inverse.",
  materials: ["Whiteboard", "Worksheet", "Graph paper"]
};

export const mockTeachingNote: TeachingNoteDto = {
  id: "tn-1",
  session_id: "s1",
  teacher_intro_script: "Ask students for everyday input/output examples.",
  stepwise_explanation: "1) Relation 2) Domain/range 3) Function rule 4) Notation.",
  worked_examples: "f(x)=2x+1 -> f(3)=7; {(1,2),(1,4)} is not a function.",
  teacher_questions: "What is the domain? Why does this fail function test?"
};

export const mockAssessment: AssessmentDto = {
  id: "a-1",
  session_id: "s1",
  assessment_type: "quiz",
  question_set: "Classify relation and evaluate f(x)=2x^2+3x-5 for x=0,1,-2.",
  answer_key: "Function test answer + values: -5, 0, -3.",
  marking_guide: "Award method marks for correct substitution."
};

export function buildTeacherProgress(): TeacherProgressDto {
  return {
    today_count: mockSessions.filter((s) => s.planned_date.slice(0, 10) === now.toISOString().slice(0, 10)).length,
    upcoming_count: mockSessions.filter((s) => new Date(s.planned_date) > now).length,
    completed_count: mockSessions.filter((s) => s.status === "delivered").length,
    pending_count: mockSessions.filter((s) => s.status !== "delivered").length,
    sessions: mockSessions
  };
}

export const mockDepartmentProgress: DepartmentProgressDto = {
  completion_rate: 72,
  pending_reviews: 6,
  teachers: [
    { id: "t1", name: "Amina Yusuf", email: "teacher1@prime.edu", planned: 20, delivered: 17, completion_rate: 85 },
    { id: "t2", name: "Samuel Kato", email: "teacher2@prime.edu", planned: 18, delivered: 11, completion_rate: 61 },
    { id: "t3", name: "Femi Ade", email: "teacher3@prime.edu", planned: 22, delivered: 14, completion_rate: 64 }
  ]
};

export const mockSchoolProgress: SchoolProgressDto = {
  total_teachers: 34,
  completion_rate: 69,
  avg_confidence: 3.7,
  departments: [
    { department: "Mathematics", completion: 74 },
    { department: "Sciences", completion: 67 },
    { department: "Humanities", completion: 63 }
  ],
  teachers_needing_support: [
    { name: "Samuel Kato", reason: "Low delivery rate, 3 overdue sessions" },
    { name: "Mary Ouma", reason: "Low confidence trend in last 2 weeks" }
  ]
};
