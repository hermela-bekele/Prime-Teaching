import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import type {
  AssessmentDto,
  AssessmentGeneratePayload,
  AuthUserDto,
  CalendarGeneratePayload,
  DepartmentProgressDto,
  GenerationJobDto,
  LessonPlanGeneratePayload,
  LoginResponse,
  RegisterResponse,
  ProgressUpdatePayload,
  SchoolProgressDto,
  SessionDto,
  SubjectDto,
  SubtopicDto,
  TeachingNoteDto,
  TeachingNoteGeneratePayload,
  TeacherProgressDto,
  UnitDto
} from "@/lib/api-types";
import {
  createMockGenerationJob,
  getMockAssessments,
  getMockGenerationJob,
  getMockSession,
  getMockTeachingNote,
  mockSessions
} from "@/lib/mock-data";
import { useAuthStore } from "@/stores/authStore";

const baseURL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")) ||
  "http://localhost:8000/api/v1";
const USE_MOCK_DATA = (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_USE_MOCK_DATA : undefined) !== "false";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" }
});
export const apiClient = api;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapDataEnvelope<T>(value: unknown): T {
  if (isRecord(value) && "data" in value) {
    return value.data as T;
  }
  return value as T;
}

function unwrapListEnvelope<T>(value: unknown, keys: string[]): T[] {
  const root = unwrapDataEnvelope<unknown>(value);
  if (Array.isArray(root)) return root as T[];
  if (!isRecord(root)) return [];

  for (const key of keys) {
    const candidate = root[key];
    if (Array.isArray(candidate)) return candidate as T[];
  }
  return [];
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const status = error.response?.status;
    if (status === 401 && typeof window !== "undefined") {
      useAuthStore.getState().logout();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { detail?: unknown } | undefined;
    if (data?.detail != null) {
      const d = data.detail;
      if (typeof d === "string") return d;
      if (Array.isArray(d)) {
        return d
          .map((x) => (typeof x === "object" && x && "msg" in x ? String((x as { msg: string }).msg) : String(x)))
          .join(", ");
      }
    }
    return error.message || "Request failed";
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export async function loginRequest(body: { email: string; password: string }): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", body);
  return unwrapDataEnvelope<LoginResponse>(data);
}

export async function registerRequest(body: {
  email: string;
  password: string;
  name?: string;
  full_name?: string;
  school_name?: string;
  role?: string;
  department_name?: string;
}): Promise<LoginResponse | RegisterResponse> {
  const { data } = await api.post<LoginResponse | RegisterResponse>("/auth/register", body);
  return unwrapDataEnvelope<LoginResponse | RegisterResponse>(data);
}

export async function fetchMe(): Promise<AuthUserDto> {
  const { data } = await api.get<AuthUserDto>("/auth/me");
  return unwrapDataEnvelope<AuthUserDto>(data);
}

export async function fetchSubjects(): Promise<SubjectDto[]> {
  const { data } = await api.get<SubjectDto[] | UnknownRecord>("/curriculum/subjects");
  return unwrapListEnvelope<SubjectDto>(data, ["subjects", "items", "results"]);
}

export async function fetchUnits(subjectId: string): Promise<UnitDto[]> {
  const { data } = await api.get<UnitDto[] | UnknownRecord>(`/curriculum/subjects/${subjectId}/units`);
  return unwrapListEnvelope<UnitDto>(data, ["units", "items", "results"]);
}

export async function fetchSubtopics(unitId: string): Promise<SubtopicDto[]> {
  const { data } = await api.get<SubtopicDto[] | UnknownRecord>(`/curriculum/units/${unitId}/subtopics`);
  return unwrapListEnvelope<SubtopicDto>(data, ["subtopics", "items", "results"]);
}

export async function fetchMySessions(params?: {
  status?: string;
  date?: string;
}): Promise<SessionDto[]> {
  if (USE_MOCK_DATA) {
    let rows = [...mockSessions];
    if (params?.status) {
      const wanted = params.status.toLowerCase();
      rows = rows.filter((s) => s.status.toLowerCase() === wanted);
    }
    if (params?.date) {
      rows = rows.filter((s) => (s.planned_date ?? "").slice(0, 10) === params.date);
    }
    return rows;
  }
  const { data } = await api.get<SessionDto[] | UnknownRecord>("/calendar/my-sessions", { params });
  return unwrapListEnvelope<SessionDto>(data, ["sessions", "items", "results"]);
}

export async function fetchSession(sessionId: string): Promise<SessionDto> {
  if (USE_MOCK_DATA) return getMockSession(sessionId);
  const { data } = await api.get<SessionDto>(`/calendar/sessions/${sessionId}`);
  return unwrapDataEnvelope<SessionDto>(data);
}

export async function fetchTeachingNoteBySession(sessionId: string): Promise<TeachingNoteDto> {
  if (USE_MOCK_DATA) return getMockTeachingNote(sessionId);
  const { data } = await api.get<TeachingNoteDto>(`/teaching-notes/session/${sessionId}`);
  return unwrapDataEnvelope<TeachingNoteDto>(data);
}

export async function fetchAssessmentsBySession(sessionId: string): Promise<AssessmentDto[]> {
  if (USE_MOCK_DATA) return getMockAssessments(sessionId);
  const { data } = await api.get<AssessmentDto[] | UnknownRecord>(`/assessments/session/${sessionId}`);
  return unwrapListEnvelope<AssessmentDto>(data, ["assessments", "items", "results"]);
}

export async function patchSessionStatus(sessionId: string, body: { status: string }): Promise<SessionDto> {
  const { data } = await api.patch<SessionDto>(`/calendar/sessions/${sessionId}/status`, body);
  return unwrapDataEnvelope<SessionDto>(data);
}

export async function postGenerateCalendar(body: CalendarGeneratePayload): Promise<GenerationJobDto> {
  if (USE_MOCK_DATA) return createMockGenerationJob("calendar");
  const { data } = await api.post<GenerationJobDto>("/generate/calendar", body);
  return unwrapDataEnvelope<GenerationJobDto>(data);
}

export async function postGenerateLessonPlan(body: LessonPlanGeneratePayload): Promise<GenerationJobDto> {
  if (USE_MOCK_DATA) return createMockGenerationJob("lesson-plan");
  const { data } = await api.post<GenerationJobDto>("/generate/lesson-plan", body);
  return unwrapDataEnvelope<GenerationJobDto>(data);
}

export async function postGenerateTeachingNote(body: TeachingNoteGeneratePayload): Promise<GenerationJobDto> {
  if (USE_MOCK_DATA) return createMockGenerationJob("teaching-note");
  const { data } = await api.post<GenerationJobDto>("/generate/teaching-note", body);
  return unwrapDataEnvelope<GenerationJobDto>(data);
}

export async function postGenerateAssessment(body: AssessmentGeneratePayload): Promise<GenerationJobDto> {
  if (USE_MOCK_DATA) return createMockGenerationJob("assessment");
  const { data } = await api.post<GenerationJobDto>("/generate/assessment", body);
  return unwrapDataEnvelope<GenerationJobDto>(data);
}

export async function fetchGenerationJob(jobId: string): Promise<GenerationJobDto> {
  if (USE_MOCK_DATA) return getMockGenerationJob(jobId);
  const { data } = await api.get<GenerationJobDto>(`/generate/jobs/${jobId}`);
  return unwrapDataEnvelope<GenerationJobDto>(data);
}

export async function postProgressUpdate(body: ProgressUpdatePayload): Promise<unknown> {
  const { data } = await api.post("/progress/update", body);
  return unwrapDataEnvelope(data);
}

export async function fetchTeacherProgress(): Promise<TeacherProgressDto> {
  const { data } = await api.get<TeacherProgressDto>("/progress/teacher");
  return unwrapDataEnvelope<TeacherProgressDto>(data);
}

export async function fetchDepartmentProgress(): Promise<DepartmentProgressDto> {
  const { data } = await api.get<DepartmentProgressDto>("/progress/department");
  return unwrapDataEnvelope<DepartmentProgressDto>(data);
}

export async function fetchSchoolProgress(): Promise<SchoolProgressDto> {
  const { data } = await api.get<SchoolProgressDto>("/progress/school");
  return unwrapDataEnvelope<SchoolProgressDto>(data);
}

export function extractAccessToken(res: LoginResponse): string | null {
  return res.access_token ?? res.token ?? null;
}

export function extractJobId(job: GenerationJobDto): string | null {
  return job.job_id ?? job.id ?? null;
}
