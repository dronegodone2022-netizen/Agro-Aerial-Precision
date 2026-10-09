// Client for the backend: Supabase Auth plus the Postgres functions in supabase/migrations.
// All grading happens in the database, so this file never sees the answer key.
import { getSupabase, isSupabaseConfigured, siteBaseUrl, type AuthKind } from './supabase';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export type EnrollmentStatus = 'pending' | 'approved' | 'rejected';

export interface Enrollment {
  id: number;
  courseId: string;
  courseTitle: string;
  status: EnrollmentStatus;
  createdAt: string;
  decidedAt: string | null;
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
  | { status: 'locked' | 'passed'; student: StudentProfile; result: ExamResult }
  | { status: 'not_enrolled'; student: StudentProfile };

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

export interface AdminEnrollment extends Enrollment {
  studentId: string;
  studentName: string;
  email: string;
  phone: string;
  message: string;
}

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export class ExamApiError extends Error {}

export const isBackendConfigured = isSupabaseConfigured;

const NOT_CONFIGURED = 'The student portal is not available right now. Please contact us on WhatsApp.';
const NETWORK_ERROR = 'Could not reach the server. Check your internet connection and try again.';

const client = async (kind: AuthKind = 'student') => {
  if (!isSupabaseConfigured) throw new ExamApiError(NOT_CONFIGURED);
  try {
    return await getSupabase(kind);
  } catch {
    throw new ExamApiError(NETWORK_ERROR);
  }
};

const rpc = async <T,>(fn: string, params: Record<string, unknown> = {}, kind: AuthKind = 'student'): Promise<T> => {
  const supabase = await client(kind);
  let response: ApiResponse<T> | null;

  try {
    const { data, error } = await supabase.rpc(fn, params);
    if (error) throw error;
    response = data as ApiResponse<T>;
  } catch {
    throw new ExamApiError(NETWORK_ERROR);
  }

  if (!response?.ok || response.data === undefined) {
    throw new ExamApiError(response?.error || 'Request failed. Please try again.');
  }
  return response.data;
};

export const getErrorMessage = (err: unknown) =>
  err instanceof ExamApiError ? err.message : 'Something went wrong. Please try again.';

const AUTH_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Invalid email or password.',
  'Email not confirmed': 'Please confirm your email first - check your inbox for the confirmation link.',
  'User already registered': 'An account with this email already exists. Please sign in instead.',
};

const authError = (message: string) => new ExamApiError(AUTH_MESSAGES[message] || message);

// --- Accounts (students and admins both use Supabase Auth) ---------------

export const registerStudent = async (details: { fullName: string; email: string; phone: string; password: string }) => {
  const supabase = await client();
  const { data, error } = await supabase.auth.signUp({
    email: details.email.trim(),
    password: details.password,
    options: {
      // Picked up by the database trigger that creates the student profile
      data: { account_type: 'student', full_name: details.fullName.trim(), phone: details.phone.trim() },
      emailRedirectTo: `${siteBaseUrl()}student`,
    },
  });
  if (error) throw authError(error.message);
  // With "Confirm email" on, there's no session until the link in the email is clicked.
  // Supabase also returns no identities for an email that's already registered.
  if (data.user && data.user.identities?.length === 0) {
    throw authError('User already registered');
  }
  return { needsEmailConfirmation: !data.session };
};

export const signIn = async (email: string, password: string, kind: AuthKind = 'student') => {
  const supabase = await client(kind);
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw authError(error.message);
};

export const signOut = async (kind: AuthKind = 'student') => {
  if (!isSupabaseConfigured) return;
  // 'local' only clears this browser's sign-in of this kind
  await (await getSupabase(kind)).auth.signOut({ scope: 'local' });
};

/** Email of the signed-in user, or null. */
export const currentUserEmail = async (kind: AuthKind = 'student'): Promise<string | null> => {
  if (!isSupabaseConfigured) return null;
  const { data } = await (await getSupabase(kind)).auth.getSession();
  return data.session?.user.email ?? null;
};

export const requestPasswordReset = async (email: string) => {
  const supabase = await client();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${siteBaseUrl()}reset-password`,
  });
  if (error) throw authError(error.message);
};

export const updatePassword = async (password: string) => {
  const supabase = await client();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw authError(error.message);
};

// --- Students -------------------------------------------------------------

export const getStudentProfile = () =>
  rpc<{ student: StudentProfile | null; enrollments: Enrollment[] }>('student_profile');

export const updateStudentProfile = (name: string, phone: string) =>
  rpc<StudentProfile>('student_update_profile', { p_name: name, p_phone: phone });

export const enrollInCourse = (courseId: string, courseTitle: string, message: string) =>
  rpc<Enrollment & { alreadyEnrolled: boolean }>('student_enroll', {
    p_course_id: courseId,
    p_course_title: courseTitle,
    p_message: message,
  });

export const getExam = () => rpc<ExamState>('exam_get');

export const submitExam = (answers: Record<string, number>) => rpc<SubmitResponse>('exam_submit', { p_answers: answers });

// --- Admins (Supabase Auth users listed in the public.admins table) ------

export const adminListLocks = () => rpc<LockedStudent[]>('admin_list_locks', {}, 'admin');

export const adminUnlock = (studentId: string) => rpc<{ cleared: boolean }>('admin_unlock', { p_student_id: studentId }, 'admin');

export const adminRecentAttempts = (limit = 50) => rpc<AttemptSummary[]>('admin_recent_attempts', { p_limit: limit }, 'admin');

export const adminListEnrollments = () => rpc<AdminEnrollment[]>('admin_list_enrollments', {}, 'admin');

export const adminSetEnrollmentStatus = (enrollmentId: number, status: EnrollmentStatus) =>
  rpc<Enrollment>('admin_set_enrollment_status', { p_enrollment_id: enrollmentId, p_status: status }, 'admin');

// --- Admins: certificates -------------------------------------------------

export interface AdminCertificate {
  id: string;
  name: string;
  course: string;
  issuedOn: string;
  link: string;
  studentId: string | null;
  createdAt: string;
}

export interface AdminStudent extends StudentProfile {
  passedExam: boolean;
  hasCertificate: boolean;
}

const CERTIFICATE_BUCKET = 'certificates';
const MAX_CERTIFICATE_FILE_BYTES = 10 * 1024 * 1024;
const CERTIFICATE_FILE_TYPES: Record<string, string> = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png' };

export const adminListCertificates = () => rpc<AdminCertificate[]>('admin_list_certificates', {}, 'admin');

export const adminListStudents = () => rpc<AdminStudent[]>('admin_list_students', {}, 'admin');

export const adminSaveCertificate = (
  certificate: { id: string; name: string; course: string; issuedOn: string; link: string; studentId: string | null },
  isNew: boolean
) =>
  rpc<AdminCertificate>('admin_save_certificate', {
    p_id: certificate.id,
    p_name: certificate.name,
    p_course: certificate.course,
    p_issued_on: certificate.issuedOn,
    p_link: certificate.link,
    p_student_id: certificate.studentId || '',
    p_is_new: isNew,
  }, 'admin');

export const adminDeleteCertificate = (certificateId: string) =>
  rpc<AdminCertificate>('admin_delete_certificate', { p_id: certificateId }, 'admin');

/** Uploads a certificate PDF/JPG/PNG to Supabase Storage and returns its public URL. */
export const uploadCertificateFile = async (file: File, certificateId: string) => {
  const extension = CERTIFICATE_FILE_TYPES[file.type];
  if (!extension) throw new ExamApiError('The certificate file must be a PDF, JPG or PNG.');
  if (file.size > MAX_CERTIFICATE_FILE_BYTES) throw new ExamApiError('The certificate file must be 10 MB or smaller.');

  const supabase = await client('admin');
  // Random suffix so a replaced file never shows a cached old version
  const safeId = certificateId.trim().toUpperCase().replace(/[^A-Z0-9_.-]/g, '');
  const path = `${safeId}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
  const { error } = await supabase.storage.from(CERTIFICATE_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new ExamApiError(`Upload failed: ${error.message}`);

  return supabase.storage.from(CERTIFICATE_BUCKET).getPublicUrl(path).data.publicUrl;
};

/** Deletes a file previously uploaded with uploadCertificateFile. Links elsewhere (e.g. Google Drive) are ignored. */
export const deleteCertificateFile = async (link: string) => {
  const marker = `/storage/v1/object/public/${CERTIFICATE_BUCKET}/`;
  const index = link.indexOf(marker);
  if (index === -1) return;

  const supabase = await client('admin');
  await supabase.storage.from(CERTIFICATE_BUCKET).remove([decodeURIComponent(link.slice(index + marker.length))]);
};

// --- Contact form & service inquiries -----------------------------------

export type MessageStatus = 'new' | 'replied' | 'archived';

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  source: string;
  status: MessageStatus;
  createdAt: string;
  replyText: string | null;
  repliedAt: string | null;
}

/** Saves a contact form / inquiry message; the database emails it to the admin. */
export const submitContactMessage = (message: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  source: string;
}) =>
  rpc<{ id: number }>('submit_contact_message', {
    p_name: message.name,
    p_email: message.email,
    p_phone: message.phone,
    p_subject: message.subject,
    p_message: message.message,
    p_source: message.source,
  });

export const adminListMessages = () => rpc<ContactMessage[]>('admin_list_messages', {}, 'admin');

/** Emails a reply to the visitor from info@ (copy to the admin inbox) and saves it. */
export const adminReplyMessage = (messageId: number, body: string) =>
  rpc<{ id: number; status: MessageStatus; replyText: string; repliedAt: string }>(
    'admin_reply_message', { p_message_id: messageId, p_body: body }, 'admin');

export const adminSetMessageStatus = (messageId: number, status: MessageStatus) =>
  rpc<{ id: number; status: MessageStatus }>('admin_set_message_status', { p_message_id: messageId, p_status: status }, 'admin');

/** WhatsApp chat link to the company number, with optional pre-filled text. */
export const companyWhatsAppUrl = (text: string) =>
  `https://api.whatsapp.com/send?phone=23277840105&text=${encodeURIComponent(text)}`;

// --- Newsletter -------------------------------------------------------------

export interface NewsletterSubscriber {
  id: number;
  email: string;
  source: string;
  createdAt: string;
}

export const subscribeNewsletter = (email: string) =>
  rpc<{ subscribed: boolean }>('subscribe_newsletter', { p_email: email, p_source: 'footer' });

export const adminListSubscribers = () => rpc<NewsletterSubscriber[]>('admin_list_subscribers', {}, 'admin');

export const adminDeleteSubscriber = (id: number) => rpc<{ deleted: boolean }>('admin_delete_subscriber', { p_id: id }, 'admin');
