import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { registerStudent, getErrorMessage } from '../src/examApi';
import AuthLayout, { ErrorBox, SuccessBox, inputClass, labelClass, primaryButtonClass, safeNext } from '../components/AuthLayout';

const MIN_PASSWORD_LENGTH = 8;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get('next'));
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
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
      const { needsEmailConfirmation } = await registerStudent({ fullName, email, phone, password });
      if (needsEmailConfirmation) {
        setCheckEmail(true);
      } else {
        navigate(next, { replace: true });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (checkEmail) {
    return (
      <AuthLayout title="Check your email">
        <SuccessBox>
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then sign in.
        </SuccessBox>
        <p className="mt-4 text-sm text-slate-600">Can't find it? Check your spam folder, or contact us on WhatsApp.</p>
        <Link to="/student-login" className="mt-6 block text-center font-semibold text-green-700 hover:underline">Go to Sign In</Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create Student Account" subtitle="Register once, then enrol in any Agro Aerial Precision Academy course.">
      <form onSubmit={handleRegister} className="space-y-4">
        <label className={labelClass}>
          Full name
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required maxLength={120} disabled={loading} className={inputClass} />
        </label>
        <label className={labelClass}>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required disabled={loading} className={inputClass} />
        </label>
        <label className={labelClass}>
          WhatsApp number
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+232 ..." required maxLength={30} disabled={loading} className={inputClass} />
        </label>
        <label className={labelClass}>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required minLength={MIN_PASSWORD_LENGTH} disabled={loading} className={inputClass} />
          <span className="mt-1 block text-xs font-normal text-slate-500">At least {MIN_PASSWORD_LENGTH} characters.</span>
        </label>
        <label className={labelClass}>
          Confirm password
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required disabled={loading} className={inputClass} />
        </label>

        <ErrorBox message={error} />

        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
        <p className="text-xs text-slate-500">
          By creating an account you agree to our <Link to="/terms-of-service" className="underline">Terms</Link> and{' '}
          <Link to="/privacy-policy" className="underline">Privacy Policy</Link>.
        </p>
      </form>

      <p className="mt-6 text-center text-slate-600">
        Already have an account?{' '}
        <Link to={`/student-login${searchParams.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-green-700 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
