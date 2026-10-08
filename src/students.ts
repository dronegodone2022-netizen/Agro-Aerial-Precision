// Student session storage. The session token is issued and checked by the exam
// backend, so editing this value in the browser can't impersonate another student.
import type { StudentProfile } from './examApi';

export interface StudentSession {
  sessionToken: string;
  student: StudentProfile;
}

const SESSION_KEY = 'student_session';

export const saveStudentSession = (session: StudentSession) => {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const getStudentSession = (): StudentSession | null => {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    return session?.sessionToken && session?.student ? session : null;
  } catch {
    return null;
  }
};

export const clearStudentSession = () => {
  sessionStorage.removeItem(SESSION_KEY);
};
