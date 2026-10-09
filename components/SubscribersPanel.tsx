import React, { useEffect, useState } from 'react';
import {
  adminDeleteSubscriber,
  adminListSubscribers,
  getErrorMessage,
  type NewsletterSubscriber,
} from '../src/examApi';

const buttonClass = 'rounded-lg px-4 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60';

const toCsv = (subscribers: NewsletterSubscriber[]) => {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = subscribers.map((s) => [s.email, new Date(s.createdAt).toISOString().slice(0, 10), s.source].map(escape).join(','));
  return ['email,subscribed_on,source', ...rows].join('\r\n');
};

/** Newsletter sign-ups from the website footer: list, search, export, remove. */
const SubscribersPanel: React.FC = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    setError('');
    try {
      setSubscribers(await adminListSubscribers());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const downloadCsv = () => {
    const blob = new Blob([toCsv(subscribers)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const remove = async (subscriber: NewsletterSubscriber) => {
    if (!window.confirm(`Remove ${subscriber.email} from the newsletter list?`)) return;
    setBusyId(subscriber.id);
    setError('');
    try {
      await adminDeleteSubscriber(subscriber.id);
      setSubscribers((current) => current.filter((s) => s.id !== subscriber.id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const visible = subscribers.filter((s) => s.email.includes(search.trim().toLowerCase()));
  const thisMonth = subscribers.filter((s) => new Date(s.createdAt) > new Date(Date.now() - 30 * 24 * 3600 * 1000)).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-green-900">Newsletter subscribers ({subscribers.length})</h2>
          <p className="text-sm text-slate-500">{thisMonth} joined in the last 30 days</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={load} className={`${buttonClass} border border-slate-300 text-slate-700 hover:bg-slate-100`}>
            Refresh
          </button>
          <button
            type="button"
            onClick={downloadCsv}
            disabled={subscribers.length === 0}
            className={`${buttonClass} bg-green-700 text-white hover:bg-green-800`}
          >
            <i className="ri-download-2-line" aria-hidden="true"></i> Download CSV
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        The CSV can be imported into MailerLite, Mailchimp, Gmail or any email tool. Remove people here if they ask to unsubscribe.
      </p>

      {error && <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <p className="text-slate-500">Loading subscribers...</p>
      ) : subscribers.length === 0 ? (
        <p className="text-slate-500">No subscribers yet. People who sign up in the website footer will appear here.</p>
      ) : (
        <>
          <label htmlFor="subscriber-search" className="sr-only">Search subscribers</label>
          <input
            id="subscriber-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email"
            className="block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-700 focus:outline-none"
          />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-slate-700">
                  <th className="border-b p-2">Email</th>
                  <th className="border-b p-2">Subscribed</th>
                  <th className="border-b p-2"></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((subscriber) => (
                  <tr key={subscriber.id}>
                    <td className="border-b p-2 break-all">
                      <a href={`mailto:${subscriber.email}`} className="text-green-800 hover:underline">{subscriber.email}</a>
                    </td>
                    <td className="border-b p-2 whitespace-nowrap">{new Date(subscriber.createdAt).toLocaleDateString()}</td>
                    <td className="border-b p-2 text-right">
                      <button
                        type="button"
                        onClick={() => remove(subscriber)}
                        disabled={busyId === subscriber.id}
                        className="font-semibold text-red-700 hover:underline disabled:opacity-60"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default SubscribersPanel;
