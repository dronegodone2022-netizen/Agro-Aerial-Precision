import React, { useEffect, useState } from 'react';
import {
  adminCurrentEmail,
  adminListLocks,
  adminRecentAttempts,
  adminSignIn,
  adminSignOut,
  adminUnlock,
  getErrorMessage,
  isExamBackendConfigured,
  type AttemptSummary,
  type LockedStudent,
} from '../src/examApi';

// Admins are Supabase Auth users whose ID is listed in the public.admins table.
// The database checks that on every admin call, so this page only controls the UI.

const formatDate = (value: string | null) => (value ? new Date(value).toLocaleString() : '-');

const AdminDashboard: React.FC = () => {
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [locks, setLocks] = useState<LockedStudent[]>([]);
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);

  const loadData = async () => {
    setError('');
    try {
      const [lockList, attemptList] = await Promise.all([adminListLocks(), adminRecentAttempts(50)]);
      setLocks(lockList);
      setAttempts(attemptList);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    adminCurrentEmail()
      .then((current) => {
        setAdminEmail(current);
        if (current) return loadData();
      })
      .finally(() => setCheckingSession(false));
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await adminSignIn(email, password);
      setPassword('');
      setAdminEmail(await adminCurrentEmail());
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    await adminSignOut();
    setAdminEmail(null);
    setLocks([]);
    setAttempts([]);
    setNotice('');
    setError('');
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

  const inputStyle: React.CSSProperties = { width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '16px', boxSizing: 'border-box' };
  const buttonStyle: React.CSSProperties = { padding: '12px 18px', borderRadius: '10px', border: 'none', background: '#166534', color: '#fff', fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1 };
  const cellStyle: React.CSSProperties = { padding: '10px 8px', borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: '14px', verticalAlign: 'top' };
  const headCellStyle: React.CSSProperties = { ...cellStyle, fontWeight: 700, color: '#334155', background: '#f8fafc' };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #14532d 55%, #1b5e20 100%)', padding: '96px 16px 32px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="admin-card-enter" style={{ width: '100%', maxWidth: '960px', margin: '0 auto', background: '#fff', borderRadius: '18px', boxShadow: '0 24px 70px rgba(0,0,0,0.22)', padding: '28px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#0f172a' }}>Exam Admin</h1>
            <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.6 }}>
              {adminEmail ? `Signed in as ${adminEmail}` : 'Sign in with your administrator account.'}
            </p>
          </div>
          {adminEmail && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={loadData} disabled={busy} style={{ ...buttonStyle, background: '#fff', color: '#166534', border: '2px solid #166534' }}>
                Refresh
              </button>
              <button type="button" onClick={handleSignOut} style={{ ...buttonStyle, background: '#475569' }}>
                Sign Out
              </button>
            </div>
          )}
        </div>

        {error && (
          <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '10px', padding: '14px', marginBottom: '18px' }}>
            {error}
          </div>
        )}

        {notice && (
          <div style={{ background: '#ecfdf5', border: '1px solid #86efac', color: '#166534', borderRadius: '10px', padding: '14px', marginBottom: '18px' }}>
            {notice}
          </div>
        )}

        {checkingSession && <p style={{ color: '#6b7280' }}>Loading...</p>}

        {!checkingSession && !adminEmail && (
          <form onSubmit={handleSignIn} style={{ display: 'grid', gap: '12px', maxWidth: '420px' }}>
            <label htmlFor="admin-email" style={{ fontWeight: 600, fontSize: '14px', color: '#334155' }}>Email</label>
            <input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required style={inputStyle} />
            <label htmlFor="admin-password" style={{ fontWeight: 600, fontSize: '14px', color: '#334155' }}>Password</label>
            <input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required style={inputStyle} />
            <button type="submit" disabled={busy} style={{ ...buttonStyle, marginTop: '8px' }}>
              {busy ? 'Signing in...' : 'Sign In'}
            </button>
            {import.meta.env.DEV && !isExamBackendConfigured && (
              <p style={{ fontSize: '13px', color: '#92400e', margin: 0 }}>Local demo mode: admin@example.com / demo-admin</p>
            )}
          </form>
        )}

        {adminEmail && (
          <>
            <h2 style={{ fontSize: '20px', color: '#14532d', margin: '8px 0 12px' }}>Locked exams ({locks.length})</h2>
            {locks.length === 0 ? (
              <p style={{ color: '#6b7280', marginBottom: '28px' }}>No students are locked out right now.</p>
            ) : (
              <div style={{ overflowX: 'auto', marginBottom: '28px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={headCellStyle}>Student</th>
                      <th style={headCellStyle}>Score</th>
                      <th style={headCellStyle}>Locked since</th>
                      <th style={headCellStyle}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {locks.map((lock) => (
                      <tr key={lock.studentId}>
                        <td style={cellStyle}>
                          <strong>{lock.studentName}</strong> ({lock.studentId})<br />
                          <span style={{ color: '#64748b' }}>{lock.email}</span>
                        </td>
                        <td style={cellStyle}>{lock.score} ({lock.percentage}%)</td>
                        <td style={cellStyle}>{formatDate(lock.createdAt)}</td>
                        <td style={{ ...cellStyle, textAlign: 'right' }}>
                          <button type="button" onClick={() => handleUnlock(lock)} disabled={busy} style={{ ...buttonStyle, background: '#16a34a', padding: '8px 14px' }}>
                            Unlock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h2 style={{ fontSize: '20px', color: '#14532d', margin: '8px 0 12px' }}>Recent attempts</h2>
            {attempts.length === 0 ? (
              <p style={{ color: '#6b7280' }}>No exam attempts yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={headCellStyle}>Student</th>
                      <th style={headCellStyle}>Started</th>
                      <th style={headCellStyle}>Submitted</th>
                      <th style={headCellStyle}>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((attempt) => (
                      <tr key={attempt.id}>
                        <td style={cellStyle}><strong>{attempt.studentName}</strong> ({attempt.studentId})</td>
                        <td style={cellStyle}>{formatDate(attempt.startedAt)}</td>
                        <td style={cellStyle}>{formatDate(attempt.submittedAt)}</td>
                        <td style={{ ...cellStyle, fontWeight: 700, color: attempt.passed === null ? '#64748b' : attempt.passed ? '#166534' : '#b91c1c' }}>
                          {attempt.passed === null
                            ? 'In progress'
                            : `${attempt.passed ? 'Passed' : 'Failed'} - ${attempt.score}/${attempt.total} (${attempt.percentage}%)`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
