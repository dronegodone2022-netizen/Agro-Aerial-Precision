// LOCAL DEVELOPMENT ONLY. Mimics google-apps-script.gs using localStorage so the
// exam pages can be worked on without the real backend. examApi.ts only loads this
// file when import.meta.env.DEV is true, so it is never part of the live site.
//
// Demo logins: AAP-001 / 1234, AAP-002 / 5678. Demo admin key: demo-admin.
// The questions below are samples - the real ones live in the private Google Sheet.

import type { ApiResponse } from './examApi';

const EXAM_DURATION_SECONDS = 5 * 60;
const SUBMIT_GRACE_SECONDS = 60;
const PASSING_PERCENTAGE = 80;
const ADMIN_KEY = 'demo-admin';
const STORAGE_KEY = 'demo_exam_backend';

const STUDENTS: Record<string, { name: string; email: string; pin: string }> = {
  'AAP-001': { name: 'Demo Student One', email: 'student1@example.com', pin: '1234' },
  'AAP-002': { name: 'Demo Student Two', email: 'student2@example.com', pin: '5678' },
};

const QUESTIONS = [
  { id: '1', question: 'Demo question: which sensor measures altitude from air pressure?', options: ['Magnetometer', 'Barometer', 'Gyroscope'], correctOption: 2, rationale: 'A barometer measures air pressure.' },
  { id: '2', question: 'Demo question: what does GNSS provide?', options: ['Position', 'Battery level', 'Motor speed'], correctOption: 1, rationale: 'GNSS provides satellite positioning.' },
  { id: '3', question: 'Demo question: where must a compass calibration be done?', options: ['In the air', 'On the ground', 'Either'], correctOption: 2, rationale: 'Always calibrate on the ground.' },
];

interface Attempt { startedAt: number; submittedAt?: number; score?: number; total?: number; percentage?: number; passed?: boolean }
interface Lock { studentId: string; studentName: string; email: string; score: number; percentage: number; resetToken: string; createdAt: string }
interface DemoState { sessions: Record<string, string>; attempts: Record<string, Attempt>; locks: Record<string, Lock> }

const load = (): DemoState => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '') as DemoState;
  } catch {
    return { sessions: {}, attempts: {}, locks: {} };
  }
};

const save = (state: DemoState) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

const fail = (error: string): ApiResponse<never> => ({ ok: false, error });

const resetLink = (studentId: string, token: string) =>
  `${window.location.origin}${window.location.pathname}#/exam-reset?studentId=${encodeURIComponent(studentId)}&token=${encodeURIComponent(token)}`;

export const handleDemoRequest = async (action: string, payload: Record<string, unknown>): Promise<ApiResponse<unknown>> => {
  const state = load();
  const studentFromSession = () => {
    const id = state.sessions[String(payload.sessionToken)];
    return id && STUDENTS[id] ? { id, name: STUDENTS[id].name, email: STUDENTS[id].email } : null;
  };

  const grade = (student: { id: string; name: string; email: string }, answers: Record<string, number>) => {
    const review = QUESTIONS.map((q) => {
      const chosenOption = Number(answers[q.id]) || null;
      return { questionId: q.id, chosenOption, isCorrect: chosenOption === q.correctOption };
    });
    const score = review.filter((r) => r.isCorrect).length;
    const total = QUESTIONS.length;
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= PASSING_PERCENTAGE;
    state.attempts[student.id] = { ...state.attempts[student.id], submittedAt: Date.now(), score, total, percentage, passed };
    if (!passed) {
      state.locks[student.id] = { studentId: student.id, studentName: student.name, email: student.email, score, percentage, resetToken: crypto.randomUUID(), createdAt: new Date().toISOString() };
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
      return { ok: true, data: { sessionToken, student: { id, name: student.name, email: student.email } } };
    }

    case 'getExam': {
      const student = studentFromSession();
      if (!student) return fail('Your session has expired. Please log in again.');
      const lock = state.locks[student.id];
      if (lock) return { ok: true, data: { status: 'locked', student, result: { score: lock.score, percentage: lock.percentage, passed: false } } };

      let attempt = state.attempts[student.id];
      if (attempt?.submittedAt && attempt.passed) {
        return { ok: true, data: { status: 'passed', student, result: { score: attempt.score, total: attempt.total, percentage: attempt.percentage, passed: true } } };
      }
      if (!attempt || attempt.submittedAt) {
        attempt = { startedAt: Date.now() };
        state.attempts[student.id] = attempt;
        save(state);
      }

      const elapsed = (Date.now() - attempt.startedAt) / 1000;
      if (elapsed > EXAM_DURATION_SECONDS + SUBMIT_GRACE_SECONDS) {
        const graded = grade(student, {});
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
      const student = studentFromSession();
      if (!student) return fail('Your session has expired. Please log in again.');
      const attempt = state.attempts[student.id];
      if (!attempt || attempt.submittedAt) return fail('There is no exam in progress. Please reload the page.');
      const isLate = (Date.now() - attempt.startedAt) / 1000 > EXAM_DURATION_SECONDS + SUBMIT_GRACE_SECONDS;
      return { ok: true, data: grade(student, isLate ? {} : (payload.answers as Record<string, number>) || {}) };
    }

    case 'checkResetToken':
    case 'resetExamLock': {
      const lock = state.locks[String(payload.studentId || '').toUpperCase()];
      if (!lock || lock.resetToken !== payload.token) return fail('Invalid or expired reset link.');
      if (action === 'checkResetToken') {
        return { ok: true, data: { studentId: lock.studentId, studentName: lock.studentName, score: lock.score, percentage: lock.percentage } };
      }
      delete state.locks[lock.studentId];
      save(state);
      return { ok: true, data: { cleared: true } };
    }

    case 'adminGetLock':
    case 'adminResetLock': {
      if (payload.adminKey !== ADMIN_KEY) return fail('Invalid admin key.');
      const lock = state.locks[String(payload.studentId || '').trim().toUpperCase()];
      if (!lock) return fail('No locked exam was found for that student ID.');
      if (action === 'adminGetLock') {
        return { ok: true, data: { ...lock, resetToken: undefined, resetLink: resetLink(lock.studentId, lock.resetToken) } };
      }
      delete state.locks[lock.studentId];
      save(state);
      return { ok: true, data: { cleared: true } };
    }

    default:
      return fail('Unknown action.');
  }
};
