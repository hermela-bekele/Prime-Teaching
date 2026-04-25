import type {
  AssessmentDto,
  GenerationJobDto,
  LessonPlanDto,
  SessionDto,
  TeachingNoteDto
} from "@/lib/api-types";

const now = new Date();
const DAY_MS = 24 * 60 * 60 * 1000;

function isoDay(offset: number): string {
  return new Date(now.getTime() + offset * DAY_MS).toISOString();
}

export const mockSessions: SessionDto[] = [
  {
    id: "mock-session-1",
    session_number: 1,
    title: "Geometric Sequences: Foundations",
    planned_date: isoDay(0),
    status: "planned",
    learning_goal_summary: "Introduce geometric patterns, common ratio, and sequence notation.",
    unit_name: "Unit 1 - Sequences and Series",
    subtopic_name: "1.2 Geometric Sequences"
  },
  {
    id: "mock-session-2",
    session_number: 2,
    title: "Geometric Sequences: Applications",
    planned_date: isoDay(0),
    status: "planned",
    learning_goal_summary: "Apply geometric sequences to growth and decay contexts.",
    unit_name: "Unit 1 - Sequences and Series",
    subtopic_name: "1.2 Geometric Sequences"
  },
  {
    id: "mock-session-3",
    session_number: 3,
    title: "Types of Functions",
    planned_date: isoDay(2),
    status: "planned",
    learning_goal_summary: "Explore linear, quadratic, polynomial, and rational function families.",
    unit_name: "Further on Relations and Functions",
    subtopic_name: "Additional types of functions"
  },
  {
    id: "mock-session-4",
    session_number: 4,
    title: "Classification of Functions",
    planned_date: isoDay(5),
    status: "planned",
    learning_goal_summary: "Classify functions as one-to-one, onto, and bijective using examples.",
    unit_name: "Further on Relations and Functions",
    subtopic_name: "Classification of functions"
  },
  {
    id: "mock-session-5",
    session_number: 5,
    title: "Composition of Functions",
    planned_date: isoDay(-1),
    status: "planned",
    learning_goal_summary: "Apply function composition and interpret f(g(x)) versus g(f(x)).",
    unit_name: "Further on Relations and Functions",
    subtopic_name: "Composition of functions"
  },
  {
    id: "mock-session-6",
    session_number: 6,
    title: "Inverse Functions",
    planned_date: isoDay(-3),
    status: "planned",
    learning_goal_summary: "Find inverse functions algebraically and connect to graph reflections.",
    unit_name: "Further on Relations and Functions",
    subtopic_name: "Inverse functions and graphs"
  },
  {
    id: "mock-session-7",
    session_number: 7,
    title: "Rational Expressions",
    planned_date: isoDay(10),
    status: "planned",
    learning_goal_summary: "Simplify and operate with rational expressions in algebraic contexts.",
    unit_name: "Rational Expressions and Rational Functions",
    subtopic_name: "Introduction to rational expressions"
  },
  {
    id: "mock-session-8",
    session_number: 8,
    title: "Relations Revision Clinic",
    planned_date: isoDay(-2),
    status: "delivered",
    learning_goal_summary: "Consolidate relation and function concepts using mixed practice.",
    unit_name: "Further on Relations and Functions",
    subtopic_name: "Revision on relations"
  }
];

export const mockLessonPlan: LessonPlanDto = {
  id: "mock-lp-1",
  objectives: [
    "Define relation, domain, range, and function.",
    "Identify whether a relation represents a function.",
    "Use function notation correctly.",
    "Evaluate functions for specific inputs."
  ],
  prior_knowledge: [
    "Basic set notation",
    "Ordered pairs and coordinate plane",
    "Algebraic substitution"
  ],
  opening:
    "Start with a vending machine analogy to connect one input to one predictable output and introduce the idea of function.",
  delivery_steps: [
    "Define relation with examples in table, set, and mapping form.",
    "Extract domain and range from a set of ordered pairs.",
    "Define function as one input mapping to exactly one output.",
    "Introduce function notation f(x) and evaluate sample values."
  ],
  guided_practice:
    "Classify sample relations together, then solve quick f(x) substitution problems with student volunteers.",
  independent_practice:
    "Students complete 6 mixed questions: function test, domain/range, and numeric evaluation.",
  classwork:
    "Worksheet sections: (A) Function or not, (B) Domain/range, (C) Evaluate f(x) for given values.",
  homework:
    "Textbook practice on function notation and domain/range, plus one real-world function example.",
  materials: ["Whiteboard", "Worksheet handout", "Graph paper", "Calculator"]
};

export const mockTeachingNote: TeachingNoteDto = {
  id: "mock-tn-1",
  session_id: "mock-session-1",
  lesson_plan_id: "mock-lp-1",
  generation_status: "generated",
  teacher_intro_script:
    "Ask students for daily examples where one input gives one predictable output, then bridge to function concept.",
  stepwise_explanation:
    "1. Relation basics\n2. Domain/range extraction\n3. Function rule\n4. Vertical line test\n5. Function notation and substitution",
  worked_examples:
    "Example 1: {(1,2),(2,3),(3,4)} is a function.\nExample 2: {(1,2),(1,3)} is not a function.\nExample 3: If f(x)=2x+1, then f(3)=7.",
  teacher_questions:
    "- Is every relation a function?\n- What is the domain?\n- What does f(5) mean?",
  student_activity_guidance:
    "Circulate during independent work, check substitution steps first, then arithmetic.",
  real_life_application:
    "Use taxi fare examples: C(d) = base fare + rate x distance.",
  struggling_student_support:
    "Provide a substitution template and one fully solved example before independent attempts.",
  average_student_support:
    "Assign additional practice on mixed function notation and graph interpretation.",
  advanced_student_extension:
    "Challenge with composition f(g(x)) and a simple piecewise function.",
  common_mistakes:
    "Common errors: mixing domain/range, treating f(x) as multiplication, sign mistakes during substitution.",
  lesson_wrap_up:
    "Exit ticket: identify if a relation is a function and evaluate one function value."
};

export const mockAssessment: AssessmentDto = {
  id: "mock-assessment-1",
  session_id: "mock-session-1",
  assessment_type: "quiz",
  question_set:
    "Part A: Function or not\n1) {(1,2),(2,3),(3,4)}\n2) {(1,2),(1,4),(2,5)}\n\nPart B: Evaluate f(x)=2x^2+3x-5\nf(0), f(1), f(-2), f(3)",
  answer_key:
    "1) Function\n2) Not a function (x=1 maps to two outputs)\nf(0)=-5, f(1)=0, f(-2)=-3, f(3)=22",
  marking_guide:
    "Award full credit for correct method and result; partial credit for valid substitution with arithmetic slip.",
  estimated_duration_minutes: 30,
  difficulty_level: "basic",
  question_format_mix: ["short_answer", "word_problem"]
};

const mockJobs = new Map<string, GenerationJobDto>();

export function createMockGenerationJob(kind: "calendar" | "lesson-plan" | "teaching-note" | "assessment"): GenerationJobDto {
  const id = `mock-job-${kind}-${Date.now()}`;
  const job: GenerationJobDto = {
    id,
    job_id: id,
    status: "completed",
    progress: 1,
    message: `${kind} generated from mock data`
  };
  mockJobs.set(id, job);
  return job;
}

export function getMockGenerationJob(jobId: string): GenerationJobDto {
  return (
    mockJobs.get(jobId) ?? {
      id: jobId,
      job_id: jobId,
      status: "completed",
      progress: 1,
      message: "mock generation completed"
    }
  );
}

export function getMockSession(sessionId: string): SessionDto {
  const row = mockSessions.find((s) => s.id === sessionId);
  const fallback = mockSessions[0];
  if (row) {
    return {
      ...row,
      lesson_plan: mockLessonPlan,
      teaching_note: { id: mockTeachingNote.id, generation_status: "generated" }
    };
  }
  if (!fallback) {
    throw new Error("mockSessions is empty; cannot resolve mock session");
  }
  return {
    ...fallback,
    lesson_plan: mockLessonPlan,
    teaching_note: { id: mockTeachingNote.id, generation_status: "generated" }
  };
}

export function getMockTeachingNote(_sessionId: string): TeachingNoteDto {
  return mockTeachingNote;
}

export function getMockAssessments(_sessionId: string): AssessmentDto[] {
  return [mockAssessment];
}
