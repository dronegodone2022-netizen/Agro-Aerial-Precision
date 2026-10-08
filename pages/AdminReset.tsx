import React, { useState } from 'react';
import { fetchExamLock } from '../src/appsScriptApi';

const ADMIN_PHONE = '+23277840105';

const AdminReset: React.FC = () => {
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lockLink, setLockLink] = useState('');
  const [lockInfo, setLockInfo] = useState<{ studentName: string; score: number; percentage: number; resetLink: string } | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLockInfo(null);
    setLockLink('');

    if (!studentId.trim()) {
      setError('Enter a student ID to look up the lock.');
      return;
    }

    setLoading(true);
    try {
      const lock = await fetchExamLock(studentId.trim().toUpperCase());

      if (!lock) {
        setError('No locked exam was found for that student ID.');
        return;
      }

      setLockInfo({
        studentName: lock.studentName,
        score: lock.score,
        percentage: lock.percentage,
        resetLink: lock.resetLink,
      });
      setLockLink(lock.resetLink);
    } catch {
      setError('Unable to load the lock record right now.');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = () => {
    if (!lockInfo?.resetLink) return;

    const message = `Admin reset link for locked exam:%0A${lockInfo.resetLink}%0A%0AStudent: ${lockInfo.studentName}%0AScore: ${lockInfo.score} (${lockInfo.percentage}%)`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(ADMIN_PHONE)}&text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #14532d 55%, #1b5e20 100%)', padding: '32px 16px', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="admin-card-enter" style={{ width: '100%', maxWidth: '680px', background: '#fff', borderRadius: '18px', boxShadow: '0 24px 70px rgba(0,0,0,0.22)', padding: '28px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#0f172a' }}>Admin Reset</h1>
          <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.6 }}>
            Look up a locked exam and send the reset link to WhatsApp from this page.
          </p>
        </div>

        <form onSubmit={handleLookup} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value.toUpperCase())}
            placeholder="Student ID e.g. AAP-001"
            style={{ flex: '1 1 240px', padding: '14px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '16px' }}
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

        {lockInfo && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '18px' }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 700, color: '#14532d' }}>Locked student</p>
            <p style={{ margin: '0 0 4px 0', color: '#14532d' }}>{lockInfo.studentName}</p>
            <p style={{ margin: '0 0 12px 0', color: '#14532d' }}>Score: {lockInfo.score} ({lockInfo.percentage}%)</p>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>Reset link</label>
            <textarea
              readOnly
              value={lockLink}
              rows={3}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', marginBottom: '14px', resize: 'vertical' }}
            />

            <button
              type="button"
              onClick={openWhatsApp}
              style={{ width: '100%', padding: '14px 18px', borderRadius: '10px', border: 'none', background: '#25d366', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
            >
              Send Reset Link on WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReset;