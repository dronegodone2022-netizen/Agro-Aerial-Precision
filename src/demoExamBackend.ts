// LOCAL DEVELOPMENT ONLY. Mimics the Supabase functions in supabase/migrations using
// localStorage, so the exam pages can be worked on without a Supabase project.
// examApi.ts only loads this file in dev when Supabase isn't configured, so it is
// never part of the live site.
//
// Demo logins: AAP-001 / 1234, AAP-002 / 5678. Demo admin: admin@example.com / demo-admin.
// The questions below are samples - the real ones live in the private Supabase table.

import type { ApiResponse } from './examApi';

const EXAM_DURATION_SECONDS = 5 * 60;
const SUBMIT_GRACE_SECONDS = 60;
const PASSING_PERCENTAGE = 80;
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'demo-admin';
const STORAGE_KEY = 'demo_exam_backend';
const ADMIN_SESSION_KEY = 'demo_exam_admin';

const STUDENTS: Record<string, { name: string; email: string; pin: string }> = {
  'AAP-001': { name: 'Demo Student One', email: 'student1@example.com', pin: '1234' },
  'AAP-002': { name: 'Demo Student Two', email: 'student2@example.com', pin: '5678' },
};

const QUESTIONS = [
  { id: '1', question: 'Demo question: which sensor measures altitude from air pressure?', options: ['Magnetometer', 'Barometer', 'Gyroscope'], correctOption: 2, rationale: 'A barometer measures air pressure.' },
  { id: '2', question: 'Demo question: what does GNSS provide?', options: ['Position', 'Battery level', 'Motor speed'], correctOption: 1, rationale: 'GNSS provides satellite positioning.' },
  { id: '3', question: 'Demo question: where must a compass calibration be done?', options: ['In the air', 'On the ground', 'Either'], correctOption: 2, rationale: 'Always calibrate on the ground.' },
];

interface Attempt {
  id: number;
  studentId: string;
  startedAt: number;
  submittedAt?: number;
  score?: number;
  total?: number;
  percentage?: number;
  passed?: boolean;
}
interface Lock { studentId: string; score: number; percentage: number; createdAt: string }
interface DemoState { sessions: Record<string, string>; attempts: Attempt[]; locks: Record<string, Lock> }

const load = (): DemoState => {
  try {
    const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '');
    if (Array.isArray(state.attempts)) return state;
  } catch {
    // fall through to a fresh state
  }
  return { sessions: {}, attempts: [], locks: {} };
};

const save = (state: DemoState) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

const fail = (error: string): ApiResponse<never> => ({ ok: false, error });

export const demoAdminSignIn = (email: string, password: string) => {
  if (email.trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    throw new Error('Invalid email or password.');
  }
  sessionStorage.setItem(ADMIN_SESSION_KEY, ADMIN_EMAIL);
};

export const demoAdminSignOut = () => sessionStorage.removeItem(ADMIN_SESSION_KEY);

export const demoAdminEmail = () => sessionStorage.getItem(ADMIN_SESSION_KEY);

export const handleDemoRequest = async (action: string, payload: Record<string, unknown>): Promise<ApiResponse<unknown>> => {
  const state = load();
  const studentJson = (id: string) => ({ id, name: STUDENTS[id].name, email: STUDENTS[id].email });
  const sessionStudentId = () => {
    const id = state.sessions[String(payload.sessionToken)];
    return id && STUDENTS[id] ? id : null;
  };
  const latestAttempt = (studentId: string) => [...state.attempts].reverse().find((a) => a.studentId === studentId);

  const grade = (studentId: string, attempt: Attempt, answers: Record<string, number>) => {
    const review = QUESTIONS.map((q) => {
      const chosenOption = Number(answers[q.id]) || null;
      return { questionId: q.id, chosenOption, isCorrect: chosenOption === q.correctOption };
    });
    const score = review.filter((r) => r.isCorrect).length;
    const total = QUESTIONS.length;
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= PASSING_PERCENTAGE;
    Object.assign(attempt, { submittedAt: Date.now(), score, total, percentage, passed });
    if (!passed) {
      state.locks[studentId] = { studentId, score, percentage, createdAt: new Date().toISOString() };
    }
    save(state);
    return {
      status: passed ? 'passed' : 'locked',
      result: { score, total, percentage, passed },
      review,
      ...(passed ? { explanations: QUESTIONS.map((q) => ({ questionId: q.id, correctOption: q.correctOption, rationale: q.rationale })) } : {}),
    };
  };

  switch (action) {
    case 'loginStudent': {
      const id = String(payload.studentId || '').trim().toUpperCase();
      const student = STUDENTS[id];
      if (!student || student.pin !== String(payload.pin || '').trim()) return fail('Invalid Student ID or PIN.');
      const sessionToken = crypto.randomUUID();
      state.sessions[sessionToken] = id;
      save(state);
      return { ok: true, data: { sessionToken, student: studentJson(id) } };
    }

    case 'getExam': {
      const studentId = sessionStudentId();
      if (!studentId) return fail('Your session has expired. Please log in again.');
      const student = studentJson(studentId);
      const lock = state.locks[studentId];
      if (lock) return { ok: true, data: { status: 'locked', student, result: { score: lock.score, percentage: lock.percentage, passed: false } } };

      let attempt = latestAttempt(studentId);
      if (attempt?.submittedAt && attempt.passed) {
        return { ok: true, data: { status: 'passed', student, result: { score: attempt.score, total: attempt.total, percentage: attempt.percentage, passed: true } } };
      }
      if (!attempt || attempt.submittedAt) {
        attempt = { id: state.attempts.length + 1, studentId, startedAt: Date.now() };
        state.attempts.push(attempt);
        save(state);
      }

      const elapsed = (Date.now() - attempt.startedAt) / 1000;
      if (elapsed > EXAM_DURATION_SECONDS + SUBMIT_GRACE_SECONDS) {
        const graded = grade(studentId, attempt, {});
        return { ok: true, data: { status: graded.status, student, result: graded.result } };
      }

      return {
        ok: true,
        data: {
          status: 'in_progress',
          student,
          secondsRemaining: Math.max(0, Math.floor(EXAM_DURATION_SECONDS - elapsed)),
          questions: QUESTIONS.map((q) => ({ id: q.id, question: q.question, options: q.options.map((text, i) => ({ id: i + 1, text })) })),
        },
      };
    }

    case 'submitExam': {
      const studentId = sessionStudentId();
      if (!studentId) return fail('Your session has expired. Please log in again.');
      const attempt = latestAttempt(studentId);
      if (!attempt || attempt.submittedAt) return fail('There is no exam in progress. Please reload the page.');
      const isLate = (Date.now() - attempt.startedAt) / 1000 > EXAM_DURATION_SECONDS + SUBMIT_GRACE_SECONDS;
      return { ok: true, data: grade(studentId, attempt, isLate ? {} : (payload.answers as Record<string, number>) || {}) };
    }

    case 'adminListLocks':
    case 'adminUnlock':
    case 'adminRecentAttempts': {
      if (!demoAdminEmail()) return fail('This account is not an exam administrator.');

      if (action === 'adminListLocks') {
        return {
          ok: true,
          data: Object.values(state.locks).map((l) => ({ ...l, studentName: STUDENTS[l.studentId]?.name, email: STUDENTS[l.studentId]?.email })),
        };
      }
      if (action === 'adminUnlock') {
        const id = String(payload.studentId || '').trim().toUpperCase();
        if (!state.locks[id]) return fail('No locked exam was found for that student ID.');
        delete state.locks[id];
        save(state);
        return { ok: true, data: { cleared: true } };
      }
      return {
        ok: true,
        data: [...state.attempts].reverse().map((a) => ({
          id: a.id,
          studentId: a.studentId,
          studentName: STUDENTS[a.studentId]?.name,
          startedAt: new Date(a.startedAt).toISOString(),
          submittedAt: a.submittedAt ? new Date(a.submittedAt).toISOString() : null,
          score: a.score ?? null,
          total: a.total ?? null,
          percentage: a.percentage ?? null,
          passed: a.passed ?? null,
        })),
      };
    }

    default:
      return fail('Unknown action.');
  }
};
