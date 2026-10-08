import React from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
}

/** Shared card layout for the student account pages. */
const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children, wide = false }) => (
  <div className="min-h-screen bg-linear-to-br from-green-900 via-green-800 to-lime-700 px-4 pt-28 pb-16 flex justify-center items-start">
    <div className={`w-full ${wide ? 'max-w-3xl' : 'max-w-md'} bg-white rounded-2xl shadow-2xl p-6 sm:p-8`}>
      <h1 className="text-2xl sm:text-3xl font-bold text-green-900">{title}</h1>
      {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  </div>
);

export default AuthLayout;

export const inputClass =
  'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/20';
export const labelClass = 'block text-sm font-semibold text-slate-700';
export const primaryButtonClass =
  'w-full rounded-lg bg-green-800 py-3 font-bold text-white hover:bg-lime-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60';

export const ErrorBox: React.FC<{ message: string }> = ({ message }) =>
  message ? (
    <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
      {message}
    </div>
  ) : null;

export const SuccessBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800">{children}</div>
);

/** Only allow in-site redirect targets like "/academy" (never "//evil.com"). */
export const safeNext = (value: string | null, fallback = '/student') =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : fallback;
