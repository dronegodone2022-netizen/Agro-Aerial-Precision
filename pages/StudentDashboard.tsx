import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  currentUserEmail,
  getStudentProfile,
  updateStudentProfile,
  signOut,
  getErrorMessage,
  type Enrollment,
  type EnrollmentStatus,
  type StudentProfile,
} from '../src/examApi';
import AuthLayout, { ErrorBox, SuccessBox, inputClass, labelClass, loginPath } from '../components/AuthLayout';

const STATUS_STYLES: Record<EnrollmentStatus, { label: string; className: string }> = {
  pending: { label: 'Awaiting payment / approval', className: 'bg-amber-100 text-amber-800' },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Not approved', className: 'bg-red-100 text-red-700' },
};

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accountEmail, setAccountEmail] = useState('');
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const email = await currentUserEmail();
        if (!email) {
          navigate(loginPath(), { replace: true });
          return;
        }
        setAccountEmail(email);
        const profile = await getStudentProfile();
        if (!profile.student) {
          // Signed in with a non-student account (e.g. an admin) - clear it and ask for a student sign-in
          await signOut();
          navigate(loginPath(undefined, 'notice=not-student'), { replace: true });
          return;
        }
        setStudent(profile.student);
        setEnrollments(profile.enrollments);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const startEditing = () => {
    if (!student) return;
    setName(student.name);
    setPhone(student.phone);
    setNotice('');
    setEditing(true);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      setStudent(await updateStudentProfile(name, phone));
      setEditing(false);
      setNotice('Your details have been updated.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/student-login', { replace: true });
  };

  const isApproved = enrollments.some((e) => e.status === 'approved');

  if (loading) {
    return (
      <AuthLayout title="Student Portal">
        <p className="text-slate-600">Loading...</p>
      </AuthLayout>
    );
  }

  if (!student) {
    return (
      <AuthLayout title="Student Portal">
        <ErrorBox message={error || 'We could not load your student profile. Please try again.'} />
        <div className="mt-6 flex flex-col gap-3">
          <button type="button" onClick={handleSignOut} className="font-semibold text-slate-600 hover:underline">Sign out</button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={`Welcome, ${student.name.split(' ')[0]}`} subtitle="Agro Aerial Precision Academy student portal" wide>
      <div className="space-y-6">
        <ErrorBox message={error} />
        {notice && <SuccessBox>{notice}</SuccessBox>}

        <section className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-green-900">My details</h2>
            {!editing && (
              <button type="button" onClick={startEditing} className="text-sm font-semibold text-green-700 hover:underline">Edit</button>
            )}
          </div>

          {editing ? (
            <form onSubmit={saveProfile} className="mt-3 space-y-3">
              <label className={labelClass}>
                Full name
                <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} className={inputClass} />
              </label>
              <label className={labelClass}>
                WhatsApp number
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={30} className={inputClass} />
              </label>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="rounded-lg bg-green-800 px-5 py-2 font-bold text-white hover:bg-lime-700 disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-slate-300 px-5 py-2 text-slate-700">Cancel</button>
              </div>
            </form>
          ) : (
            <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-500">Student ID</dt><dd className="font-semibold">{student.id}</dd></div>
              <div><dt className="text-slate-500">Name</dt><dd className="font-semibold">{student.name}</dd></div>
              <div><dt className="text-slate-500">Email</dt><dd className="font-semibold break-all">{student.email}</dd></div>
              <div><dt className="text-slate-500">WhatsApp</dt><dd className="font-semibold">{student.phone || '-'}</dd></div>
            </dl>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-green-900">My courses</h2>
            <Link to="/academy" className="text-sm font-semibold text-green-700 hover:underline">Browse courses</Link>
          </div>

          {enrollments.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">
              You haven't enrolled in a course yet. <Link to="/academy" className="font-semibold text-green-700 underline">Choose a course</Link> to get started.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {enrollments.map((enrollment) => (
                <li key={enrollment.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{enrollment.courseTitle}</p>
                    <p className="text-xs text-slate-500">Enrolled {new Date(enrollment.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`self-start rounded-full px-3 py-1 text-xs font-bold sm:self-auto ${STATUS_STYLES[enrollment.status].className}`}>
                    {STATUS_STYLES[enrollment.status].label}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {enrollments.some((e) => e.status === 'pending') && (
            <p className="mt-2 text-xs text-slate-500">
              Pending enrolments are approved once your payment is confirmed. Questions? Message us on WhatsApp: +232 77 840 105.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 p-4">
          <h2 className="text-lg font-bold text-green-900">Certification exam</h2>
          {isApproved ? (
            <>
              <p className="mt-2 text-sm text-slate-600">5 minutes, 80% to pass. Make sure you have a stable connection before you start.</p>
              <Link to="/drone-exam" className="mt-3 inline-block rounded-lg bg-green-800 px-5 py-2.5 font-bold text-white hover:bg-lime-700">
                Go to Exam
              </Link>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-600">Your exam unlocks once one of your course enrolments is approved.</p>
          )}
        </section>

        <div className="flex flex-wrap justify-between gap-3 text-sm">
          <Link to="/reset-password" className="font-semibold text-green-700 hover:underline">Change password</Link>
          <button type="button" onClick={handleSignOut} className="font-semibold text-slate-600 hover:underline">Sign out</button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default StudentDashboard;
