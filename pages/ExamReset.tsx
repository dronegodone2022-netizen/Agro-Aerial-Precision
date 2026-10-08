import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { checkResetToken, resetExamLock, getErrorMessage, type LockSummary } from '../src/examApi';

// Opened from the reset link in the exam results email that only the admin receives.
const ExamReset: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'checking' | 'invalid' | 'ready' | 'resetting' | 'reset'>('checking');
  const [message, setMessage] = useState('');
  const [lockData, setLockData] = useState<LockSummary | null>(null);

  const studentId = searchParams.get('studentId') || '';
  const token = searchParams.get('token') || '';

  useEffect(() => {
    if (!studentId || !token) {
      setMessage('This reset link is incomplete.');
      setStatus('invalid');
      return;
    }

    checkResetToken(studentId, token)
      .then((lock) => {
        setLockData(lock);
        setStatus('ready');
      })
      .catch((err) => {
        setMessage(getErrorMessage(err));
        setStatus('invalid');
      });
  }, [studentId, token]);

  const handleReset = async () => {
    setStatus('resetting');
    try {
      await resetExamLock(studentId, token);
      setStatus('reset');
    } catch (err) {
      setMessage(getErrorMessage(err));
      setStatus('invalid');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '560px', background: '#fff', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', padding: '32px' }}>
        <h1 style={{ margin: '0 0 12px 0', color: '#1b5e20', fontSize: '28px' }}>Exam Reset Console</h1>
        <p style={{ margin: '0 0 20px 0', color: '#4b5563', lineHeight: 1.6 }}>
          This page unlocks a student's exam using the reset link from the exam results email.
        </p>

        {status === 'checking' && <p style={{ color: '#6b7280' }}>Checking reset link...</p>}

        {status === 'invalid' && (
          <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
            {message || 'Invalid or expired reset link.'}
          </div>
        )}

        {(status === 'ready' || status === 'resetting') && lockData && (
          <>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 8px 0', color: '#166534', fontWeight: 700 }}>Locked student</p>
              <p style={{ margin: 0, color: '#166534' }}>{lockData.studentName} ({lockData.studentId})</p>
              <p style={{ margin: '8px 0 0 0', color: '#166534' }}>Score: {lockData.score} ({lockData.percentage}%)</p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              disabled={status === 'resetting'}
              style={{ width: '100%', background: '#16a34a', color: '#fff', border: 'none', padding: '14px 18px', borderRadius: '10px', fontSize: '16px', fontWeight: 700, cursor: status === 'resetting' ? 'not-allowed' : 'pointer', opacity: status === 'resetting' ? 0.7 : 1 }}
            >
              {status === 'resetting' ? 'Resetting...' : 'Reset Exam Lock'}
            </button>
          </>
        )}

        {status === 'reset' && (
          <div style={{ background: '#ecfdf5', border: '1px solid #86efac', borderRadius: '10px', padding: '16px' }}>
            <p style={{ margin: 0, color: '#166534', fontWeight: 700 }}>Exam lock cleared.</p>
            <p style={{ margin: '8px 0 0 0', color: '#166534' }}>The student can log in again and retake the exam.</p>
            <button
              type="button"
              onClick={() => navigate('/student-login')}
              style={{ marginTop: '16px', width: '100%', background: '#14532d', color: '#fff', border: 'none', padding: '12px 16px', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}
            >
              Go to Student Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamReset;
