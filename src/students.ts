// Student data management utilities
export interface StudentData {
  id: string;
  name: string;
  email: string;
  pin?: string;
  loginTime: string;
}

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
