import { clearExamLock, getExamLock, saveExamLock, verifyStudentLogin, type ExamLockData, type StudentData } from './students';

type ScriptResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL?.trim() || '';

const hasRemoteApi = Boolean(scriptUrl);

const postJson = async <T,>(action: string, payload: Record<string, unknown>): Promise<ScriptResponse<T>> => {
  if (!hasRemoteApi) {
    return { ok: false, error: 'Google Apps Script URL is not configured.' };
  }

  const response = await fetch(scriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });

  const data = await response.json().catch(() => ({}));
  return data as ScriptResponse<T>;
};

export const isAppsScriptConfigured = () => hasRemoteApi;

export const loginStudent = async (studentId: string, pin: string): Promise<StudentData | null> => {
  if (!hasRemoteApi) {
    return verifyStudentLogin(studentId, pin);
  }

  const result = await postJson<StudentData>('loginStudent', { studentId, pin });
  if (result.ok && result.data) {
    return result.data;
  }

  return null;
};

export const fetchExamLock = async (studentId: string): Promise<ExamLockData | null> => {
  if (!hasRemoteApi) {
    return getExamLock();
  }

  const result = await postJson<ExamLockData>('getExamLock', { studentId });
  return result.ok ? result.data || null : null;
};

export const createExamLock = async (studentData: StudentData, score: number, percentage: number): Promise<ExamLockData> => {
  if (!hasRemoteApi) {
    return saveExamLock(studentData, score, percentage);
  }

  const result = await postJson<ExamLockData>('createExamLock', {
    studentId: studentData.id,
    studentName: studentData.name,
    studentEmail: studentData.email,
    score,
    percentage,
  });

  if (!result.ok || !result.data) {
    return saveExamLock(studentData, score, percentage);
  }

  return result.data;
};

export const resetExamLock = async (studentId: string, token: string): Promise<boolean> => {
  if (!hasRemoteApi) {
    const currentLock = getExamLock();
    if (!currentLock || currentLock.studentId !== studentId || currentLock.resetToken !== token) {
      return false;
    }

    clearExamLock();
    return true;
  }

  const result = await postJson<{ cleared: boolean }>('resetExamLock', { studentId, token });
  return Boolean(result.ok && result.data?.cleared);
};

export const buildResetLink = (studentId: string, token: string) => {
  if (!hasRemoteApi) {
    return '';
  }

  return `${window.location.origin}${window.location.pathname}#/exam-reset?studentId=${encodeURIComponent(studentId)}&token=${encodeURIComponent(token)}`;
};