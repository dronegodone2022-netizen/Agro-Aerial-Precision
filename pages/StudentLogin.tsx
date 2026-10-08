import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { signIn, getErrorMessage } from '../src/examApi';
import AuthLayout, { ErrorBox, SuccessBox, inputClass, labelClass, primaryButtonClass, safeNext } from '../components/AuthLayout';

const StudentLogin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get('next'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const nextQuery = searchParams.get('next') ? `?next=${encodeURIComponent(next)}` : '';

  return (
    <AuthLayout
      title="Student Sign In"
      subtitle={next.startsWith('/academy') ? 'Sign in or create a free account to enrol in a course.' : 'Agro Aerial Precision Academy student portal.'}
    >
      {searchParams.get('notice') === 'not-student' && (
        <div className="mb-4">
          <SuccessBox>
            That account is not a student account, so it has been signed out of the Student Portal.
            Sign in with a student account below. Admins sign in at <Link to="/admin" className="font-semibold underline">Exam Admin</Link>.
          </SuccessBox>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <label className={labelClass}>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required disabled={loading} className={inputClass} />
        </label>
        <label className={labelClass}>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required disabled={loading} className={inputClass} />
        </label>

        <div className="text-right -mt-2">
          <Link to="/forgot-password" className="text-sm text-green-700 hover:underline">Forgot password?</Link>
        </div>

        <ErrorBox message={error} />

        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-slate-600">
        New student?{' '}
        <Link to={`/register${nextQuery}`} className="font-semibold text-green-700 hover:underline">Create an account</Link>
      </p>
    </AuthLayout>
  );
};

export default StudentLogin;
