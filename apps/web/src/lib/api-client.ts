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
import { useAuthStore } from "@/stores/authStore";

const baseURL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")) ||
  "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" }
});

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
  return data;
}

export async function registerRequest(body: {
  email: string;
  password: string;
  name?: string;
  full_name?: string;
  school_name?: string;
  role?: string;
}): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/register", body);
  return data;
}

export async function fetchMe(): Promise<AuthUserDto> {
  const { data } = await api.get<AuthUserDto>("/auth/me");
  return data;
}

export async function fetchSubjects(): Promise<SubjectDto[]> {
  const { data } = await api.get<SubjectDto[]>("/curriculum/subjects");
  return data;
}

export async function fetchUnits(subjectId: string): Promise<UnitDto[]> {
  const { data } = await api.get<UnitDto[]>(`/curriculum/subjects/${subjectId}/units`);
  return data;
}

export async function fetchSubtopics(unitId: string): Promise<SubtopicDto[]> {
  const { data } = await api.get<SubtopicDto[]>(`/curriculum/units/${unitId}/subtopics`);
  return data;
}

export async function fetchMySessions(params?: {
  status?: string;
  date?: string;
}): Promise<SessionDto[]> {
  const { data } = await api.get<SessionDto[] | { sessions?: SessionDto[] }>("/calendar/my-sessions", { params });
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "sessions" in data && Array.isArray(data.sessions)) return data.sessions;
  return [];
}

export async function fetchSession(sessionId: string): Promise<SessionDto> {
  const { data } = await api.get<SessionDto>(`/calendar/sessions/${sessionId}`);
  return data;
}

export async function fetchTeachingNoteBySession(sessionId: string): Promise<TeachingNoteDto> {
  const { data } = await api.get<TeachingNoteDto>(`/teaching-notes/session/${sessionId}`);
  return data;
}

export async function fetchAssessmentsBySession(sessionId: string): Promise<AssessmentDto[]> {
  const { data } = await api.get<AssessmentDto[]>(`/assessments/session/${sessionId}`);
  return Array.isArray(data) ? data : [];
}

export async function patchSessionStatus(sessionId: string, body: { status: string }): Promise<SessionDto> {
  const { data } = await api.patch<SessionDto>(`/calendar/sessions/${sessionId}/status`, body);
  return data;
}

export async function postGenerateCalendar(body: CalendarGeneratePayload): Promise<GenerationJobDto> {
  const { data } = await api.post<GenerationJobDto>("/generate/calendar", body);
  return data;
}

export async function postGenerateLessonPlan(body: LessonPlanGeneratePayload): Promise<GenerationJobDto> {
  const { data } = await api.post<GenerationJobDto>("/generate/lesson-plan", body);
  return data;
}

export async function postGenerateTeachingNote(body: TeachingNoteGeneratePayload): Promise<GenerationJobDto> {
  const { data } = await api.post<GenerationJobDto>("/generate/teaching-note", body);
  return data;
}

export async function postGenerateAssessment(body: AssessmentGeneratePayload): Promise<GenerationJobDto> {
  const { data } = await api.post<GenerationJobDto>("/generate/assessment", body);
  return data;
}

export async function fetchGenerationJob(jobId: string): Promise<GenerationJobDto> {
  const { data } = await api.get<GenerationJobDto>(`/generate/jobs/${jobId}`);
  return data;
}

export async function postProgressUpdate(body: ProgressUpdatePayload): Promise<unknown> {
  const { data } = await api.post("/progress/update", body);
  return data;
}

export async function fetchTeacherProgress(): Promise<TeacherProgressDto> {
  const { data } = await api.get<TeacherProgressDto>("/progress/teacher");
  return data;
}

export async function fetchDepartmentProgress(): Promise<DepartmentProgressDto> {
  const { data } = await api.get<DepartmentProgressDto>("/progress/department");
  return data;
}

export async function fetchSchoolProgress(): Promise<SchoolProgressDto> {
  const { data } = await api.get<SchoolProgressDto>("/progress/school");
  return data;
}

export function extractAccessToken(res: LoginResponse): string | null {
  return res.access_token ?? res.token ?? null;
}

export function extractJobId(job: GenerationJobDto): string | null {
  return job.job_id ?? job.id ?? null;
}
