import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyStudentLogin, saveStudentSession, getAvailableStudentIds } from '../src/students';

const StudentLogin: React.FC = () => {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQRList, setShowQRList] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const studentData = verifyStudentLogin(studentId, pin);
      
      if (!studentData) {
        setError('Invalid Student ID or PIN. Please try again.');
        setLoading(false);
        return;
      }

      saveStudentSession(studentData);
      setLoading(false);
      navigate('/drone-exam');
    } catch (err) {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleQuickSelect = (id: string) => {
    setStudentId(id);
    setShowQRList(false);
  };

  const availableIds = getAvailableStudentIds();

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
    buttonSecondary: {
      padding: '10px 15px',
      background: '#f5f5f5',
      color: '#2e7d32',
      border: '2px solid #2e7d32',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
    } as React.CSSProperties,
    error: {
      color: '#c62828',
      fontSize: '14px',
      padding: '12px',
      background: '#ffebee',
      borderRadius: '6px',
      border: '1px solid #ef5350',
    } as React.CSSProperties,
    qrListContainer: {
      marginTop: '20px',
      padding: '15px',
      background: '#f9f9f9',
      borderRadius: '6px',
      border: '1px solid #e0e0e0',
    } as React.CSSProperties,
    qrListTitle: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#666',
      marginBottom: '10px',
      textTransform: 'uppercase' as const,
    } as React.CSSProperties,
    qrListItems: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
      gap: '8px',
    } as React.CSSProperties,
    qrItem: {
      padding: '8px',
      background: 'white',
      border: '1px solid #2e7d32',
      borderRadius: '4px',
      fontSize: '12px',
      cursor: 'pointer',
      textAlign: 'center' as const,
      color: '#2e7d32',
      fontWeight: '600',
      transition: 'all 0.2s',
    } as React.CSSProperties,
    loading: {
      textAlign: 'center' as const,
      color: '#2e7d32',
      fontSize: '16px',
      fontWeight: '600',
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

          <button
            type="button"
            onClick={() => setShowQRList(!showQRList)}
            style={styles.buttonSecondary}
            disabled={loading}
          >
            {showQRList ? '✕ Hide Demo IDs' : '📱 Show Demo IDs'}
          </button>
        </form>

        {showQRList && (
          <div style={styles.qrListContainer}>
            <div style={styles.qrListTitle}>Demo Student IDs (PIN: last 4 digits)</div>
            <div style={styles.qrListItems}>
              {availableIds.map((id) => (
                <div
                  key={id}
                  style={styles.qrItem}
                  onClick={() => handleQuickSelect(id)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = '#2e7d32';
                    (e.currentTarget as HTMLElement).style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'white';
                    (e.currentTarget as HTMLElement).style.color = '#2e7d32';
                  }}
                >
                  {id}
                </div>
              ))}
            </div>
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
