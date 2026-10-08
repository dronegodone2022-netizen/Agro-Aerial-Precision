import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { currentUserEmail, updatePassword, getErrorMessage } from '../src/examApi';
import AuthLayout, { ErrorBox, inputClass, labelClass, primaryButtonClass } from '../components/AuthLayout';

const MIN_PASSWORD_LENGTH = 8;

// Opened from the password-reset email. Supabase signs the user in from the link's
// "?code=" (see AuthLinkHandler in App.tsx); this page then sets the new password.
const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'checking' | 'ready' | 'invalid'>('checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    currentUserEmail()
      .then((current) => {
        setEmail(current || '');
        setStatus(current ? 'ready' : 'invalid');
      })
      .catch(() => setStatus('invalid'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      navigate('/student', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Choose a new password" subtitle={email ? `For ${email}` : undefined}>
      {status === 'checking' && <p className="text-slate-600">Checking your reset link...</p>}

      {status === 'invalid' && (
        <>
          <ErrorBox message="This reset link has expired, was already used, or was opened on a different device or browser." />
          <Link to="/forgot-password" className="mt-6 block text-center font-semibold text-green-700 hover:underline">Request a new link</Link>
        </>
      )}

      {status === 'ready' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className={labelClass}>
            New password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required minLength={MIN_PASSWORD_LENGTH} disabled={loading} className={inputClass} />
          </label>
          <label className={labelClass}>
            Confirm new password
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required disabled={loading} className={inputClass} />
          </label>
          <ErrorBox message={error} />
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? 'Saving...' : 'Save New Password'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPassword;
