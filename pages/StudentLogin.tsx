import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveStudentSession } from '../src/students';
import { loginStudent, getErrorMessage, isExamBackendConfigured } from '../src/examApi';

const StudentLogin: React.FC = () => {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const session = await loginStudent(studentId, pin);
      saveStudentSession(session);
      navigate('/drone-exam');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    } as React.CSSProperties,
    card: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
      padding: '40px',
      maxWidth: '450px',
      width: '100%',
    } as React.CSSProperties,
    header: {
      textAlign: 'center' as const,
      marginBottom: '30px',
    },
    title: {
      color: '#2e7d32',
      fontSize: '28px',
      fontWeight: 'bold',
      margin: '0 0 10px 0',
    } as React.CSSProperties,
    subtitle: {
      color: '#666',
      fontSize: '16px',
      margin: '0',
      fontWeight: '400',
    } as React.CSSProperties,
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '20px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#333',
    } as React.CSSProperties,
    input: {
      padding: '12px 15px',
      border: '2px solid #e0e0e0',
      borderRadius: '6px',
      fontSize: '16px',
      transition: 'border-color 0.3s',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    } as React.CSSProperties,
    button: {
      padding: '12px 20px',
      background: '#2e7d32',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background 0.3s',
      marginTop: '10px',
    } as React.CSSProperties,
    error: {
      color: '#c62828',
      fontSize: '14px',
      padding: '12px',
      background: '#ffebee',
      borderRadius: '6px',
      border: '1px solid #ef5350',
    } as React.CSSProperties,
    devHint: {
      marginTop: '20px',
      padding: '12px',
      background: '#fff8e1',
      border: '1px dashed #f9a825',
      borderRadius: '6px',
      fontSize: '13px',
      color: '#6d4c00',
      textAlign: 'center' as const,
    } as React.CSSProperties,
    footer: {
      marginTop: '30px',
      paddingTop: '20px',
      borderTop: '1px solid #e0e0e0',
      textAlign: 'center' as const,
      color: '#666',
      fontSize: '12px',
    } as React.CSSProperties,
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>🚁 Exam Portal</h1>
          <p style={styles.subtitle}>Agro Aerial Precision Certification</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="studentId" style={styles.label}>Student ID</label>
            <input
              id="studentId"
              type="text"
              placeholder="e.g., AAP-001"
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value.toUpperCase());
                setError('');
              }}
              style={styles.input}
              disabled={loading}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="pin" style={styles.label}>PIN</label>
            <input
              id="pin"
              type="password"
              placeholder="Enter your 4-digit PIN"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError('');
              }}
              maxLength={4}
              style={styles.input}
              disabled={loading}
              required
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Start Exam'}
          </button>

        </form>

        {import.meta.env.DEV && !isExamBackendConfigured && (
          <div style={styles.devHint}>
            Local demo mode: use AAP-001 / 1234 (admin page: admin@example.com / demo-admin)
          </div>
        )}

        <div style={styles.footer}>
          <p>Questions? Contact the administrator for your Student ID and PIN.</p>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
