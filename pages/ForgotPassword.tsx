import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset, getErrorMessage } from '../src/examApi';
import AuthLayout, { ErrorBox, SuccessBox, inputClass, labelClass, primaryButtonClass } from '../components/AuthLayout';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your account email and we'll send you a link to choose a new password.">
      {sent ? (
        <>
          <SuccessBox>
            If an account exists for <strong>{email}</strong>, a reset link is on its way. Open it on this same device and browser.
          </SuccessBox>
          <p className="mt-4 text-sm text-slate-600">Can't find it? Check your spam folder, or contact us on WhatsApp.</p>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className={labelClass}>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required disabled={loading} className={inputClass} />
          </label>
          <ErrorBox message={error} />
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}
      <Link to="/student-login" className="mt-6 block text-center font-semibold text-green-700 hover:underline">Back to Sign In</Link>
    </AuthLayout>
  );
};

export default ForgotPassword;
