import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchExamLock, resetExamLock } from '../src/appsScriptApi';
import type { ExamLockData } from '../src/students';

const ExamReset: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'checking' | 'invalid' | 'ready' | 'reset'>('checking');

  const studentId = searchParams.get('studentId') || '';
  const token = searchParams.get('token') || '';
  const [lockData, setLockData] = useState<ExamLockData | null>(null);

  useEffect(() => {
    if (!studentId || !token) {
      setStatus('invalid');
      return;
    }

    fetchExamLock(studentId).then((lock) => {
      setLockData(lock);

      if (!lock || lock.studentId !== studentId || lock.resetToken !== token) {
        setStatus('invalid');
        return;
      }

      setStatus('ready');
    });
  }, [studentId, token]);

  const handleReset = () => {
    if (!lockData) return;

    resetExamLock(lockData.studentId, lockData.resetToken).then((cleared) => {
      if (cleared) {
        setStatus('reset');
      } else {
        setStatus('invalid');
      }
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '560px', background: '#fff', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', padding: '32px' }}>
        <h1 style={{ margin: '0 0 12px 0', color: '#1b5e20', fontSize: '28px' }}>Exam Reset Console</h1>
        <p style={{ margin: '0 0 20px 0', color: '#4b5563', lineHeight: 1.6 }}>
          This page is intended for the admin reset link sent through WhatsApp. It clears the locked exam state only when the token matches.
        </p>

        {status === 'checking' && <p style={{ color: '#6b7280' }}>Checking reset link...</p>}

        {status === 'invalid' && (
          <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
            Invalid or expired reset link.
          </div>
        )}

        {status === 'ready' && lockData && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
            <p style={{ margin: '0 0 8px 0', color: '#166534', fontWeight: 700 }}>Locked student</p>
            <p style={{ margin: 0, color: '#166534' }}>{lockData.studentName} ({lockData.studentId})</p>
            <p style={{ margin: '8px 0 0 0', color: '#166534' }}>Score: {lockData.score} ({lockData.percentage}%)</p>
          </div>
        )}

        {status === 'ready' && (
          <button
            type="button"
            onClick={handleReset}
            style={{ width: '100%', background: '#16a34a', color: '#fff', border: 'none', padding: '14px 18px', borderRadius: '10px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}
          >
            Reset Exam Lock
          </button>
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
