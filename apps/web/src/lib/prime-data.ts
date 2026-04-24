"use client";

export type UserRole = "teacher" | "department-head" | "school-leader" | "admin";

export type SessionStatus = "upcoming" | "today" | "overdue" | "completed";

export type SessionMaterial = "Lesson Plan" | "Teaching Note" | "Quiz";

export type SessionItem = {
  id: string;
  sessionNumber: number;
  title: string;
  unit: string;
  subtopic: string;
  plannedDate: string;
  status: SessionStatus;
  materials: SessionMaterial[];
};

export const roleLabel: Record<UserRole, string> = {
  teacher: "Teacher",
  "department-head": "Department Head",
  "school-leader": "School Leader",
  admin: "Admin"
};

export const roleHome: Record<UserRole, string> = {
  teacher: "/teacher",
  "department-head": "/department-head",
  "school-leader": "/school-leader",
  admin: "/admin/calendars"
};

export const teacherSessions: SessionItem[] = [
  {
    id: "s1",
    sessionNumber: 12,
    title: "Quadratic Functions in Context",
    unit: "Algebra II",
    subtopic: "Vertex form and transformations",
    plannedDate: "2026-04-23",
    status: "today",
    materials: ["Lesson Plan", "Teaching Note", "Quiz"]
  },
  {
    id: "s2",
    sessionNumber: 13,
    title: "Factoring and Roots",
    unit: "Algebra II",
    subtopic: "Solving by factorization",
    plannedDate: "2026-04-24",
    status: "upcoming",
    materials: ["Lesson Plan", "Teaching Note"]
  },
  {
    id: "s3",
    sessionNumber: 11,
    title: "Graphing Parabolas",
    unit: "Algebra II",
    subtopic: "Table-to-graph review",
    plannedDate: "2026-04-21",
    status: "overdue",
    materials: ["Lesson Plan", "Quiz"]
  },
  {
    id: "s4",
    sessionNumber: 10,
    title: "Functions Refresher",
    unit: "Algebra II",
    subtopic: "Domain and range",
    plannedDate: "2026-04-20",
    status: "completed",
    materials: ["Lesson Plan", "Teaching Note", "Quiz"]
  }
];

export const teacherStats = [
  { label: "Today's Sessions", value: "1" },
  { label: "Upcoming", value: "6" },
  { label: "Completed", value: "18" },
  { label: "Pending / Overdue", value: "2" }
];

export const departmentTeacherProgress = [
  { teacher: "Ms. Hana", planned: 34, delivered: 29, completion: 85 },
  { teacher: "Mr. Dube", planned: 31, delivered: 25, completion: 80 },
  { teacher: "Ms. Selam", planned: 33, delivered: 32, completion: 97 }
];

export const overdueTeacherSessions = [
  { teacher: "Mr. Dube", session: "Session 14 - Linear Systems", overdueDays: 2 },
  { teacher: "Ms. Hana", session: "Session 21 - Probability Trees", overdueDays: 1 }
];

export const pendingPlanReviews = [
  { id: "r1", teacher: "Ms. Selam", lesson: "Session 22 - Trigonometric Ratios" },
  { id: "r2", teacher: "Ms. Hana", lesson: "Session 18 - Exponential Growth" }
];

export const schoolLeaderDepartmentRates = [
  { department: "Mathematics", completion: 89 },
  { department: "Sciences", completion: 82 },
  { department: "Languages", completion: 91 }
];

export const schoolLeaderTrend = [72, 74, 77, 81, 84, 86, 88];

export const supportList = [
  { name: "Mr. Dube", reason: "2 overdue sessions this week" },
  { name: "Ms. Beth", reason: "Low confidence on delivery logs" }
];
