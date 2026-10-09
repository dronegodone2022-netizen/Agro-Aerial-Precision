import React, { useEffect, useState } from 'react';
import {
  adminListEnrollments,
  adminListLocks,
  adminListSubscribers,
  adminRecentAttempts,
  adminSetEnrollmentStatus,
  adminUnlock,
  currentUserEmail,
  getErrorMessage,
  signIn,
  signOut,
  type AdminEnrollment,
  type AttemptSummary,
  type EnrollmentStatus,
  type LockedStudent,
} from '../src/examApi';
import CertificatesPanel from '../components/CertificatesPanel';
import MessagesPanel from '../components/MessagesPanel';
import SubscribersPanel from '../components/SubscribersPanel';
import { ADMIN_HEARTBEAT_MS, adminAwayTooLong, clearAdminSeen, markAdminSeen } from '../src/adminSession';

// Admins are Supabase Auth users whose ID is listed in the public.admins table.
// The database checks that on every admin call, so this page only controls the UI.

type Tab = 'students' | 'messages' | 'certificates' | 'subscribers';

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

const Avatar: React.FC<{ name: string }> = ({ name }) => (
  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lime-100 text-sm font-bold text-green-800">
    {initials(name)}
  </span>
);

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  approved: 'bg-green-50 text-green-700 ring-green-200',
  rejected: 'bg-red-50 text-red-700 ring-red-200',
  passed: 'bg-green-50 text-green-700 ring-green-200',
  failed: 'bg-red-50 text-red-700 ring-red-200',
  progress: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const Badge: React.FC<{ tone: keyof typeof STATUS_BADGE; children: React.ReactNode }> = ({ tone, children }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_BADGE[tone]}`}>{children}</span>
);

const Card: React.FC<{ title?: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }> = ({ title, subtitle, action, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    {title && (
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);

const EmptyState: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <div className="flex flex-col items-center gap-2 px-5 py-10 text-center text-sm text-slate-500">
    <i className={`${icon} text-3xl text-slate-300`} aria-hidden="true"></i>
    {text}
  </div>
);

const th = 'px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500';
const td = 'px-5 py-4 align-top text-sm text-slate-700';
const smallButton = 'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';

const AdminDashboard: React.FC = () => {
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [locks, setLocks] = useState<LockedStudent[]>([]);
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [enrollments, setEnrollments] = useState<AdminEnrollment[]>([]);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>('students');
  const [newMessageCount, setNewMessageCount] = useState(0);

  const loadData = async () => {
    setError('');
    setLoadingData(true);
    try {
      const [enrollmentList, lockList, attemptList] = await Promise.all([
        adminListEnrollments(),
        adminListLocks(),
        adminRecentAttempts(50),
      ]);
      setEnrollments(enrollmentList);
      setLocks(lockList);
      setAttempts(attemptList);
      adminListSubscribers()
        .then((list) => setSubscriberCount(list.length))
        .catch(() => setSubscriberCount(null));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingData(false);
    }
  };

  const clearDashboard = () => {
    setAdminEmail(null);
    setLocks([]);
    setEnrollments([]);
    setAttempts([]);
    setSubscriberCount(null);
    setError('');
  };

  // Sign out if the admin has been away from this page for more than a minute
  const signOutIfAway = async () => {
    if (!adminAwayTooLong()) return false;
    await signOut('admin');
    clearAdminSeen();
    clearDashboard();
    setNotice('You were signed out because you left the admin page for more than 1 minute. Please sign in again.');
    return true;
  };

  useEffect(() => {
    (async () => {
      try {
        const current = await currentUserEmail('admin');
        if (current && !(await signOutIfAway())) {
          markAdminSeen();
          setAdminEmail(current);
          await loadData();
        }
      } finally {
        setCheckingSession(false);
      }
    })();
  }, []);

  // While signed in: keep "last seen" fresh when the page is visible, check on return
  useEffect(() => {
    if (!adminEmail) return;

    // A long gap between heartbeats (e.g. the laptop went to sleep) also counts as away
    const heartbeat = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      signOutIfAway().then((signedOut) => {
        if (!signedOut) markAdminSeen();
      });
    }, ADMIN_HEARTBEAT_MS);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        signOutIfAway().then((signedOut) => {
          if (!signedOut) markAdminSeen();
        });
      } else {
        markAdminSeen(); // the moment they left
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', markAdminSeen);
    return () => {
      clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', markAdminSeen);
      markAdminSeen(); // navigating to another page of the site
    };
  }, [adminEmail]);

  // Success messages fade away on their own
  useEffect(() => {
    if (!notice || !adminEmail) return;
    const timer = window.setTimeout(() => setNotice(''), 6000);
    return () => window.clearTimeout(timer);
  }, [notice, adminEmail]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await signIn(email, password, 'admin');
      markAdminSeen();
      setPassword('');
      setAdminEmail(await currentUserEmail('admin'));
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    await signOut('admin');
    clearAdminSeen();
    clearDashboard();
    setNotice('');
  };

  const handleEnrollmentStatus = async (enrollment: AdminEnrollment, status: EnrollmentStatus) => {
    const verb = status === 'approved' ? 'Approve' : status === 'rejected' ? 'Reject' : 'Move back to pending';
    if (!window.confirm(`${verb} ${enrollment.studentName}'s enrolment in "${enrollment.courseTitle}"?`)) {
      return;
    }
    setBusy(true);
    setError('');
    try {
      await adminSetEnrollmentStatus(enrollment.id, status);
      setNotice(`${enrollment.studentName} (${enrollment.courseTitle}): ${status}.`);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleUnlock = async (lock: LockedStudent) => {
    if (!window.confirm(`Unlock the exam for ${lock.studentName} (${lock.studentId})? Only do this after the retake fee is paid.`)) {
      return;
    }
    setBusy(true);
    setError('');
    try {
      await adminUnlock(lock.studentId);
      setNotice(`${lock.studentName} (${lock.studentId}) can now retake the exam.`);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const pendingCount = enrollments.filter((e) => e.status === 'pending').length;

  // --- Sign-in screen --------------------------------------------------------
  if (!adminEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-950 via-green-950 to-green-900 px-4 pt-24 pb-12">
        <div className="admin-card-enter w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-700 text-2xl text-white">
              <i className="ri-shield-keyhole-line" aria-hidden="true"></i>
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-sm text-slate-500">Agro Aerial Precision</p>
            </div>
          </div>

          {notice && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{notice}</div>}
          {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          {checkingSession ? (
            <p className="py-6 text-center text-slate-500">Checking your session...</p>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                <div className="relative">
                  <i className="ri-mail-line pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true"></i>
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                    className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 focus:border-green-600 focus:outline-none focus:ring-4 focus:ring-green-600/15"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="admin-password" className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <i className="ri-lock-line pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true"></i>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-11 focus:border-green-600 focus:outline-none focus:ring-4 focus:ring-green-600/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-700"
                  >
                    <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} aria-hidden="true"></i>
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 py-3 font-bold text-white transition-colors hover:bg-green-800 disabled:opacity-60"
              >
                {busy ? 'Signing in...' : <>Sign in <i className="ri-arrow-right-line" aria-hidden="true"></i></>}
              </button>
              <p className="text-center text-xs text-slate-400">For security, you're signed out after 1 minute away from this page.</p>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- Dashboard -------------------------------------------------------------
  const navItems: { key: Tab; label: string; icon: string; count?: number }[] = [
    { key: 'students', label: 'Students & Exams', icon: 'ri-graduation-cap-line', count: pendingCount + locks.length },
    { key: 'messages', label: 'Messages', icon: 'ri-mail-unread-line', count: newMessageCount },
    { key: 'certificates', label: 'Certificates', icon: 'ri-award-line' },
    { key: 'subscribers', label: 'Subscribers', icon: 'ri-newspaper-line' },
  ];

  const stats = [
    { label: 'Pending enrolments', value: pendingCount, icon: 'ri-user-add-line', tone: 'bg-amber-50 text-amber-600', go: 'students' as Tab },
    { label: 'Locked exams', value: locks.length, icon: 'ri-lock-line', tone: 'bg-red-50 text-red-600', go: 'students' as Tab },
    { label: 'New messages', value: newMessageCount, icon: 'ri-mail-line', tone: 'bg-sky-50 text-sky-600', go: 'messages' as Tab },
    { label: 'Subscribers', value: subscriberCount ?? '-', icon: 'ri-group-line', tone: 'bg-green-50 text-green-700', go: 'subscribers' as Tab },
  ];

  const activeItem = navItems.find((item) => item.key === tab)!;

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-6">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center gap-3 px-2 py-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-700 text-white">
                <i className="ri-dashboard-line" aria-hidden="true"></i>
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">Admin</p>
                <p className="text-xs text-slate-500">Agro Aerial Precision</p>
              </div>
            </div>
            <nav aria-label="Admin sections" className="flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  aria-current={tab === item.key ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                    tab === item.key ? 'bg-green-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <i className={`${item.icon} text-lg`} aria-hidden="true"></i>
                  <span className="flex-1">{item.label}</span>
                  {!!item.count && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${tab === item.key ? 'bg-white/25 text-white' : 'bg-red-500 text-white'}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <div className="mt-4 border-t border-slate-100 px-2 pt-4">
              <p className="truncate text-xs text-slate-500" title={adminEmail}>Signed in as</p>
              <p className="truncate text-sm font-semibold text-slate-800" title={adminEmail}>{adminEmail}</p>
              <button
                type="button"
                onClick={handleSignOut}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                <i className="ri-logout-box-r-line" aria-hidden="true"></i> Sign out
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          {/* Mobile navigation */}
          <div className="flex items-center justify-between gap-3 lg:hidden">
            <p className="truncate text-sm text-slate-500">{adminEmail}</p>
            <button type="button" onClick={handleSignOut} className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600">
              Sign out
            </button>
          </div>
          <nav aria-label="Admin sections" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                aria-current={tab === item.key ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                  tab === item.key ? 'bg-green-700 text-white' : 'border border-slate-200 bg-white text-slate-600'
                }`}
              >
                <i className={item.icon} aria-hidden="true"></i>
                {item.label}
                {!!item.count && <span className="rounded-full bg-red-500 px-1.5 text-xs text-white">{item.count}</span>}
              </button>
            ))}
          </nav>

          {/* Page header */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{activeItem.label}</h1>
              <p className="text-sm text-slate-500">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            {tab === 'students' && (
              <button
                type="button"
                onClick={loadData}
                disabled={busy || loadingData}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
              >
                <i className={`ri-refresh-line ${loadingData ? 'animate-spin' : ''}`} aria-hidden="true"></i> Refresh
              </button>
            )}
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <i className="ri-error-warning-line text-lg" aria-hidden="true"></i>
              <span className="flex-1">{error}</span>
              <button type="button" onClick={() => setError('')} aria-label="Dismiss" className="text-red-400 hover:text-red-700">
                <i className="ri-close-line" aria-hidden="true"></i>
              </button>
            </div>
          )}
          {notice && (
            <div role="status" className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <i className="ri-checkbox-circle-line text-lg" aria-hidden="true"></i>
              <span className="flex-1">{notice}</span>
              <button type="button" onClick={() => setNotice('')} aria-label="Dismiss" className="text-green-500 hover:text-green-800">
                <i className="ri-close-line" aria-hidden="true"></i>
              </button>
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {stats.map((stat) => (
              <button
                key={stat.label}
                type="button"
                onClick={() => setTab(stat.go)}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${stat.tone}`}>
                  <i className={stat.icon} aria-hidden="true"></i>
                </span>
                <span>
                  <span className="block text-2xl font-bold text-slate-900">{stat.value}</span>
                  <span className="block text-xs font-medium text-slate-500">{stat.label}</span>
                </span>
              </button>
            ))}
          </div>

          {tab === 'certificates' && (
            <Card>
              <div className="p-5">
                <CertificatesPanel />
              </div>
            </Card>
          )}

          {tab === 'subscribers' && (
            <Card>
              <div className="p-5">
                <SubscribersPanel />
              </div>
            </Card>
          )}

          {/* Kept mounted (hidden) so the new-message count is always up to date */}
          <div hidden={tab !== 'messages'}>
            <Card>
              <div className="p-5">
                <MessagesPanel onNewCount={setNewMessageCount} />
              </div>
            </Card>
          </div>

          {tab === 'students' && (
            <>
              <Card title="Course enrolments" subtitle={`${pendingCount} waiting for approval - approve once payment is received`}>
                {enrollments.length === 0 ? (
                  <EmptyState icon="ri-user-add-line" text="No course enrolments yet." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px]">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className={th}>Student</th>
                          <th className={th}>Course</th>
                          <th className={th}>Status</th>
                          <th className={`${th} text-right`}>Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {enrollments.map((enrollment) => (
                          <tr key={enrollment.id} className="hover:bg-slate-50/60">
                            <td className={td}>
                              <div className="flex gap-3">
                                <Avatar name={enrollment.studentName} />
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-900">{enrollment.studentName}</p>
                                  <p className="text-xs text-slate-500">{enrollment.studentId}</p>
                                  <p className="break-all text-xs text-slate-500">{enrollment.email}</p>
                                  {enrollment.phone && (
                                    <a
                                      href={`https://wa.me/${enrollment.phone.replace(/[^0-9]/g, '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:underline"
                                    >
                                      <i className="ri-whatsapp-line" aria-hidden="true"></i> {enrollment.phone}
                                    </a>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className={td}>
                              <p className="font-medium text-slate-800">{enrollment.courseTitle}</p>
                              <p className="text-xs text-slate-500">{formatDate(enrollment.createdAt)}</p>
                              {enrollment.message && <p className="mt-1 text-xs italic text-slate-500">"{enrollment.message}"</p>}
                            </td>
                            <td className={td}>
                              <Badge tone={enrollment.status}>
                                {enrollment.status === 'pending' ? 'Pending' : enrollment.status === 'approved' ? 'Approved' : 'Rejected'}
                              </Badge>
                            </td>
                            <td className={`${td} whitespace-nowrap text-right`}>
                              <div className="inline-flex gap-2">
                                {enrollment.status !== 'approved' && (
                                  <button
                                    type="button"
                                    onClick={() => handleEnrollmentStatus(enrollment, 'approved')}
                                    disabled={busy}
                                    className={`${smallButton} bg-green-700 text-white hover:bg-green-800`}
                                  >
                                    <i className="ri-check-line" aria-hidden="true"></i> Approve
                                  </button>
                                )}
                                {enrollment.status !== 'rejected' && (
                                  <button
                                    type="button"
                                    onClick={() => handleEnrollmentStatus(enrollment, 'rejected')}
                                    disabled={busy}
                                    className={`${smallButton} border border-red-200 text-red-700 hover:bg-red-50`}
                                  >
                                    <i className="ri-close-line" aria-hidden="true"></i> Reject
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              <Card title="Locked exams" subtitle="Students who did not pass - unlock after the retake fee is paid">
                {locks.length === 0 ? (
                  <EmptyState icon="ri-lock-unlock-line" text="No students are locked out right now." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className={th}>Student</th>
                          <th className={th}>Score</th>
                          <th className={th}>Locked since</th>
                          <th className={`${th} text-right`}>Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {locks.map((lock) => (
                          <tr key={lock.studentId} className="hover:bg-slate-50/60">
                            <td className={td}>
                              <div className="flex gap-3">
                                <Avatar name={lock.studentName} />
                                <div>
                                  <p className="font-semibold text-slate-900">{lock.studentName}</p>
                                  <p className="text-xs text-slate-500">{lock.studentId}</p>
                                  <p className="break-all text-xs text-slate-500">{lock.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className={td}><Badge tone="failed">{lock.score} correct · {lock.percentage}%</Badge></td>
                            <td className={td}>{formatDate(lock.createdAt)}</td>
                            <td className={`${td} text-right`}>
                              <button
                                type="button"
                                onClick={() => handleUnlock(lock)}
                                disabled={busy}
                                className={`${smallButton} bg-green-700 text-white hover:bg-green-800`}
                              >
                                <i className="ri-lock-unlock-line" aria-hidden="true"></i> Unlock
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              <Card title="Recent exam attempts" subtitle="The last 50 attempts">
                {attempts.length === 0 ? (
                  <EmptyState icon="ri-file-list-3-line" text="No exam attempts yet." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className={th}>Student</th>
                          <th className={th}>Started</th>
                          <th className={th}>Submitted</th>
                          <th className={th}>Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attempts.map((attempt) => (
                          <tr key={attempt.id} className="hover:bg-slate-50/60">
                            <td className={td}>
                              <div className="flex items-center gap-3">
                                <Avatar name={attempt.studentName} />
                                <div>
                                  <p className="font-semibold text-slate-900">{attempt.studentName}</p>
                                  <p className="text-xs text-slate-500">{attempt.studentId}</p>
                                </div>
                              </div>
                            </td>
                            <td className={td}>{formatDate(attempt.startedAt)}</td>
                            <td className={td}>{formatDate(attempt.submittedAt)}</td>
                            <td className={td}>
                              {attempt.passed === null ? (
                                <Badge tone="progress">In progress</Badge>
                              ) : (
                                <Badge tone={attempt.passed ? 'passed' : 'failed'}>
                                  {attempt.passed ? 'Passed' : 'Failed'} · {attempt.score}/{attempt.total} ({attempt.percentage}%)
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
