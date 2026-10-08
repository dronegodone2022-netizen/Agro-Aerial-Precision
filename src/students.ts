// Student data management utilities
export interface StudentData {
  id: string;
  name: string;
  email: string;
  pin?: string;
  loginTime: string;
}

export interface ExamLockData {
  studentId: string;
  studentName: string;
  score: number;
  percentage: number;
  resetToken: string;
  resetLink: string;
  createdAt: string;
}

const EXAM_LOCK_KEY = 'exam_lock_state';

const createResetToken = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

export const buildExamResetLink = (studentId: string, resetToken: string) => {
  if (typeof window === 'undefined') {
    return '';
  }

  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  return `${baseUrl}#/exam-reset?studentId=${encodeURIComponent(studentId)}&token=${encodeURIComponent(resetToken)}`;
};

export const saveExamLock = (studentData: StudentData, score: number, percentage: number): ExamLockData => {
  const resetToken = createResetToken();
  const lockData: ExamLockData = {
    studentId: studentData.id,
    studentName: studentData.name,
    score,
    percentage,
    resetToken,
    resetLink: buildExamResetLink(studentData.id, resetToken),
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(EXAM_LOCK_KEY, JSON.stringify(lockData));
  return lockData;
};

export const getExamLock = (): ExamLockData | null => {
  const raw = localStorage.getItem(EXAM_LOCK_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as ExamLockData;
  } catch {
    return null;
  }
};

export const clearExamLock = () => {
  localStorage.removeItem(EXAM_LOCK_KEY);
};

// Demo student database - Replace with API call in production
const DEMO_STUDENTS: Record<string, { name: string; email: string; pin: string }> = {
  "AAP-001": { name: "Ahmed Conteh", email: "ahmed@example.com", pin: "1234" },
  "AAP-002": { name: "Fatima Hassan", email: "fatima@example.com", pin: "5678" },
  "AAP-003": { name: "Ibrahim Jalloh", email: "ibrahim@example.com", pin: "9012" },
  "AAP-004": { name: "Zainab Mohamed", email: "zainab@example.com", pin: "3456" },
  "AAP-005": { name: "Sekou Kamara", email: "sekou@example.com", pin: "7890" },
};

/**
 * Verify student login via PIN
 * @param studentId - Student ID (e.g., AAP-001)
 * @param pin - Student PIN
 * @returns StudentData if valid, null otherwise
 */
export const verifyStudentLogin = (studentId: string, pin: string): StudentData | null => {
  const student = DEMO_STUDENTS[studentId.toUpperCase()];
  
  if (!student) return null;
  if (student.pin !== pin) return null;

  return {
    id: studentId.toUpperCase(),
    name: student.name,
    email: student.email,
    loginTime: new Date().toISOString(),
  };
};

/**
 * Save student session to sessionStorage
 */
export const saveStudentSession = (studentData: StudentData) => {
  sessionStorage.setItem("student_session", JSON.stringify(studentData));
};

/**
 * Get current student session
 */
export const getStudentSession = (): StudentData | null => {
  const session = sessionStorage.getItem("student_session");
  return session ? JSON.parse(session) : null;
};

/**
 * Clear student session on logout
 */
export const clearStudentSession = () => {
  sessionStorage.removeItem("student_session");
};

/**
 * Get all available student IDs (for demo QR list)
 */
export const getAvailableStudentIds = (): string[] => {
  return Object.keys(DEMO_STUDENTS);
};
