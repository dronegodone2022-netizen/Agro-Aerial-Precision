// Client for the exam backend: Postgres functions in supabase/migrations.
// All grading happens in the database, so this file never sees the answer key.
import { getSupabase, isSupabaseConfigured } from './supabase';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
}

export interface ExamQuestion {
  id: string;
  question: string;
  options: { id: number; text: string }[];
}

export interface ExamResult {
  score: number;
  total?: number;
  percentage: number;
  passed: boolean;
}

export type ExamState =
  | { status: 'in_progress'; student: StudentProfile; secondsRemaining: number; questions: ExamQuestion[] }
  | { status: 'locked' | 'passed'; student: StudentProfile; result: ExamResult };

export interface SubmitResponse {
  status: 'locked' | 'passed';
  result: ExamResult;
  review: { questionId: string; chosenOption: number | null; isCorrect: boolean }[];
  explanations?: { questionId: string; correctOption: number; rationale: string }[];
}

export interface LockedStudent {
  studentId: string;
  studentName: string;
  email: string;
  score: number;
  percentage: number;
  createdAt: string;
}

export interface AttemptSummary {
  id: number;
  studentId: string;
  studentName: string;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  total: number | null;
  percentage: number | null;
  passed: boolean | null;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export class ExamApiError extends Error {}

export const isExamBackendConfigured = isSupabaseConfigured;

// Frontend action name -> database function name
const RPC_FUNCTIONS = {
  loginStudent: 'exam_login',
  getExam: 'exam_get',
  submitExam: 'exam_submit',
  adminListLocks: 'admin_list_locks',
  adminUnlock: 'admin_unlock',
  adminRecentAttempts: 'admin_recent_attempts',
} as const;

type Action = keyof typeof RPC_FUNCTIONS;

// { studentId: 'x' } -> { p_student_id: 'x' }
const toRpcParams = (payload: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [`p_${key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)}`, value])
  );

const call = async <T,>(action: Action, payload: Record<string, unknown> = {}): Promise<T> => {
  let response: ApiResponse<unknown>;

  try {
    if (isSupabaseConfigured) {
      const supabase = await getSupabase();
      const { data, error } = await supabase.rpc(RPC_FUNCTIONS[action], toRpcParams(payload));
      if (error) throw error;
      response = data as ApiResponse<unknown>;
    } else if (import.meta.env.DEV) {
      // Local development only. `import.meta.env.DEV` is a literal `false` in production builds,
      // so this branch and the demo data are removed from the live site.
      const { handleDemoRequest } = await import('./demoExamBackend');
      response = await handleDemoRequest(action, payload);
    } else {
      throw new ExamApiError('The exam portal is not configured yet. Please contact the administrator.');
    }
  } catch (err) {
    if (err instanceof ExamApiError) throw err;
    throw new ExamApiError('Could not reach the exam server. Check your internet connection and try again.');
  }

  if (!response?.ok || response.data === undefined) {
    throw new ExamApiError(response?.error || 'Request failed. Please try again.');
  }
  return response.data as T;
};

export const getErrorMessage = (err: unknown) =>
  err instanceof ExamApiError ? err.message : 'Something went wrong. Please try again.';

// --- Students -------------------------------------------------------------

export const loginStudent = (studentId: string, pin: string) =>
  call<{ sessionToken: string; student: StudentProfile }>('loginStudent', { studentId, pin });

export const getExam = (sessionToken: string) =>
  call<ExamState>('getExam', { sessionToken });

export const submitExam = (sessionToken: string, answers: Record<string, number>) =>
  call<SubmitResponse>('submitExam', { sessionToken, answers });

// --- Admins (Supabase Auth users listed in the public.admins table) ------

export const adminListLocks = () => call<LockedStudent[]>('adminListLocks');

export const adminUnlock = (studentId: string) => call<{ cleared: boolean }>('adminUnlock', { studentId });

export const adminRecentAttempts = (limit = 50) => call<AttemptSummary[]>('adminRecentAttempts', { limit });

export const adminSignIn = async (email: string, password: string) => {
  if (import.meta.env.DEV && !isSupabaseConfigured) {
    try {
      (await import('./demoExamBackend')).demoAdminSignIn(email, password);
    } catch (err) {
      throw new ExamApiError((err as Error).message);
    }
    return;
  }
  if (!isSupabaseConfigured) {
    throw new ExamApiError('The exam portal is not configured yet.');
  }

  const supabase = await getSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) {
    throw new ExamApiError(error.message === 'Invalid login credentials' ? 'Invalid email or password.' : error.message);
  }
};

export const adminSignOut = async () => {
  if (import.meta.env.DEV && !isSupabaseConfigured) {
    (await import('./demoExamBackend')).demoAdminSignOut();
  } else if (isSupabaseConfigured) {
    await (await getSupabase()).auth.signOut();
  }
};

/** Email of the signed-in admin, or null. */
export const adminCurrentEmail = async (): Promise<string | null> => {
  if (import.meta.env.DEV && !isSupabaseConfigured) {
    return (await import('./demoExamBackend')).demoAdminEmail();
  }
  if (!isSupabaseConfigured) return null;

  const { data } = await (await getSupabase()).auth.getSession();
  return data.session?.user.email ?? null;
};
