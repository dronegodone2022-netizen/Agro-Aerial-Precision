import React, { useState } from 'react';
import { adminGetLock, adminResetLock, getErrorMessage, type AdminLock } from '../src/examApi';

const ADMIN_KEY_STORAGE = 'aap_admin_key';

const readStoredKey = () => {
  try {
    return sessionStorage.getItem(ADMIN_KEY_STORAGE) || '';
  } catch {
    return '';
  }
};

// Every action here is checked against the ADMIN_KEY stored in the Apps Script project.
const AdminReset: React.FC = () => {
  const [adminKey, setAdminKey] = useState(readStoredKey);
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [lockInfo, setLockInfo] = useState<AdminLock | null>(null);

  const rememberKey = () => {
    try {
      sessionStorage.setItem(ADMIN_KEY_STORAGE, adminKey);
    } catch {
      // Storage unavailable (private mode) - the admin just re-enters the key.
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLockInfo(null);

    if (!adminKey.trim() || !studentId.trim()) {
      setError('Enter the admin key and a student ID.');
      return;
    }

    setLoading(true);
    try {
      const lock = await adminGetLock(adminKey.trim(), studentId.trim().toUpperCase());
      rememberKey();
      setLockInfo(lock);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (!lockInfo) return;
    setLoading(true);
    setError('');
    try {
      await adminResetLock(adminKey.trim(), lockInfo.studentId);
      setNotice(`${lockInfo.studentName} (${lockInfo.studentId}) can now retake the exam.`);
      setLockInfo(null);
      setStudentId('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const copyResetLink = async () => {
    if (!lockInfo) return;
    try {
      await navigator.clipboard.writeText(lockInfo.resetLink);
      setNotice('Reset link copied.');
    } catch {
      setNotice('Could not copy automatically - select the link and copy it manually.');
    }
  };

  const inputStyle: React.CSSProperties = { flex: '1 1 240px', padding: '14px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '16px' };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #14532d 55%, #1b5e20 100%)', padding: '32px 16px', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="admin-card-enter" style={{ width: '100%', maxWidth: '680px', background: '#fff', borderRadius: '18px', boxShadow: '0 24px 70px rgba(0,0,0,0.22)', padding: '28px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#0f172a' }}>Admin Reset</h1>
          <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.6 }}>
            Look up a locked exam and unlock it after the retake fee has been paid.
          </p>
        </div>

        <form onSubmit={handleLookup} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
          <label htmlFor="admin-key" style={{ position: 'absolute', left: '-9999px' }}>Admin key</label>
          <input
            id="admin-key"
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Admin key"
            autoComplete="current-password"
            style={inputStyle}
          />
          <label htmlFor="admin-student-id" style={{ position: 'absolute', left: '-9999px' }}>Student ID</label>
          <input
            id="admin-student-id"
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value.toUpperCase())}
            placeholder="Student ID e.g. AAP-001"
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '14px 18px', borderRadius: '10px', border: 'none', background: '#166534', color: '#fff', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Loading...' : 'Find Lock'}
          </button>
        </form>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '10px', padding: '14px', marginBottom: '18px' }}>
            {error}
          </div>
        )}

        {notice && (
          <div style={{ background: '#ecfdf5', border: '1px solid #86efac', color: '#166534', borderRadius: '10px', padding: '14px', marginBottom: '18px' }}>
            {notice}
          </div>
        )}

        {lockInfo && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '18px' }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 700, color: '#14532d' }}>Locked student</p>
            <p style={{ margin: '0 0 4px 0', color: '#14532d' }}>{lockInfo.studentName} ({lockInfo.studentId})</p>
            <p style={{ margin: '0 0 4px 0', color: '#14532d' }}>{lockInfo.email}</p>
            <p style={{ margin: '0 0 12px 0', color: '#14532d' }}>Score: {lockInfo.score} ({lockInfo.percentage}%)</p>

            <button
              type="button"
              onClick={handleUnlock}
              disabled={loading}
              style={{ width: '100%', padding: '14px 18px', borderRadius: '10px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '10px' }}
            >
              Unlock Exam Now
            </button>
            <button
              type="button"
              onClick={copyResetLink}
              style={{ width: '100%', padding: '12px 18px', borderRadius: '10px', border: '2px solid #16a34a', background: '#fff', color: '#166534', fontWeight: 700, cursor: 'pointer' }}
            >
              Copy Reset Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReset;
