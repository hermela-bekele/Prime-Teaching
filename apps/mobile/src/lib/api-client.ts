import axios from "axios";

import type {
  AssessmentDto,
  DepartmentProgressDto,
  LessonPlanDto,
  LoginResponse,
  SchoolProgressDto,
  SessionDto,
  TeacherProgressDto,
  TeachingNoteDto,
  UserRole
} from "@/lib/api-types";
import {
  buildTeacherProgress,
  mockAssessment,
  mockDepartmentProgress,
  mockLessonPlan,
  mockSchoolProgress,
  mockSessions,
  mockTeachingNote,
  mockUsers
} from "@/lib/mock-data";

const baseURL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000/api/v1";
const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK_DATA !== "false";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" }
});

function roleFromBackend(role: string | undefined | null): UserRole {
  if (!role) return "teacher";
  const normalized = role.toLowerCase();
  if (normalized.includes("admin")) return "admin";
  if (normalized.includes("leader")) return "school_leader";
  if (normalized.includes("department") || normalized.includes("head")) return "department_head";
  return "teacher";
}

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  if (USE_MOCK_DATA) {
    const user = mockUsers[email.toLowerCase()];
    if (!user || user.password !== password) throw new Error("Invalid email or password");
    return {
      access_token: `mock-token-${user.role}-${Date.now()}`,
      role: user.role,
      name: user.name,
      email
    };
  }
  const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
  return { ...data, role: roleFromBackend(data.role) };
}

export async function fetchTeacherProgress(): Promise<TeacherProgressDto> {
  if (USE_MOCK_DATA) return buildTeacherProgress();
  const { data } = await api.get<TeacherProgressDto>("/progress/teacher");
  return data;
}

export async function fetchSession(sessionId: string): Promise<SessionDto> {
  if (USE_MOCK_DATA) {
    const row = mockSessions.find((s) => s.id === sessionId) ?? mockSessions[0];
    if (!row) throw new Error("No session data available");
    return row;
  }
  const { data } = await api.get<SessionDto>(`/calendar/sessions/${sessionId}`);
  return data;
}

export async function fetchLessonPlan(_sessionId: string): Promise<LessonPlanDto> {
  if (USE_MOCK_DATA) return mockLessonPlan;
  const { data } = await api.get<LessonPlanDto>("/lesson-plans/session");
  return data;
}

export async function fetchTeachingNote(_sessionId: string): Promise<TeachingNoteDto> {
  if (USE_MOCK_DATA) return mockTeachingNote;
  const { data } = await api.get<TeachingNoteDto>("/teaching-notes/session");
  return data;
}

export async function fetchAssessment(_sessionId: string): Promise<AssessmentDto> {
  if (USE_MOCK_DATA) return mockAssessment;
  const { data } = await api.get<AssessmentDto>("/assessments/session");
  return data;
}

export async function fetchDepartmentProgress(): Promise<DepartmentProgressDto> {
  if (USE_MOCK_DATA) return mockDepartmentProgress;
  const { data } = await api.get<DepartmentProgressDto>("/progress/department");
  return data;
}

export async function fetchSchoolProgress(): Promise<SchoolProgressDto> {
  if (USE_MOCK_DATA) return mockSchoolProgress;
  const { data } = await api.get<SchoolProgressDto>("/progress/school");
  return data;
}
