// Client for the exam backend (google-apps-script.gs).
// All grading happens on the server: this file never sees the answer key.

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

export interface LockSummary {
  studentId: string;
  studentName: string;
  score: number;
  percentage: number;
}

export interface AdminLock extends LockSummary {
  email: string;
  createdAt: string;
  resetLink: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export class ExamApiError extends Error {}

const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL?.trim() || '';

const callRemote = async (action: string, payload: Record<string, unknown>): Promise<ApiResponse<unknown>> => {
  // text/plain avoids a CORS preflight request, which Apps Script web apps can't answer.
  const response = await fetch(scriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload }),
  });
  return response.json();
};

const call = async <T,>(action: string, payload: Record<string, unknown>): Promise<T> => {
  let response: ApiResponse<unknown>;

  try {
    if (scriptUrl) {
      response = await callRemote(action, payload);
    } else if (import.meta.env.DEV) {
      // Local development only - this branch (and the demo data) is removed from production builds.
      const { handleDemoRequest } = await import('./demoExamBackend');
      response = await handleDemoRequest(action, payload);
    } else {
      throw new ExamApiError('The exam portal is not configured yet. Please contact the administrator.');
    }
  } catch (err) {
    if (err instanceof ExamApiError) throw err;
    throw new ExamApiError('Could not reach the exam server. Check your internet connection and try again.');
  }

  if (!response.ok || response.data === undefined) {
    throw new ExamApiError(response.error || 'Request failed. Please try again.');
  }
  return response.data as T;
};

export const getErrorMessage = (err: unknown) =>
  err instanceof ExamApiError ? err.message : 'Something went wrong. Please try again.';

export const loginStudent = (studentId: string, pin: string) =>
  call<{ sessionToken: string; student: StudentProfile }>('loginStudent', { studentId, pin });

export const getExam = (sessionToken: string) =>
  call<ExamState>('getExam', { sessionToken });

export const submitExam = (sessionToken: string, answers: Record<string, number>) =>
  call<SubmitResponse>('submitExam', { sessionToken, answers });

export const checkResetToken = (studentId: string, token: string) =>
  call<LockSummary>('checkResetToken', { studentId, token });

export const resetExamLock = (studentId: string, token: string) =>
  call<{ cleared: boolean }>('resetExamLock', { studentId, token });

export const adminGetLock = (adminKey: string, studentId: string) =>
  call<AdminLock>('adminGetLock', { adminKey, studentId });

export const adminResetLock = (adminKey: string, studentId: string) =>
  call<{ cleared: boolean }>('adminResetLock', { adminKey, studentId });
