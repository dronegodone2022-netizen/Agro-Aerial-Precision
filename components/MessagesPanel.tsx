import React, { useEffect, useState } from 'react';
import {
  adminListMessages,
  adminReplyMessage,
  adminSetMessageStatus,
  getErrorMessage,
  type ContactMessage,
  type MessageStatus,
} from '../src/examApi';

const FILTERS: { key: MessageStatus | 'all'; label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'replied', label: 'Replied' },
  { key: 'archived', label: 'Archived' },
  { key: 'all', label: 'All' },
];

const STATUS_STYLES: Record<MessageStatus, string> = {
  new: 'bg-amber-100 text-amber-800',
  replied: 'bg-green-100 text-green-800',
  archived: 'bg-slate-200 text-slate-600',
};

const sourceLabel = (source: string) =>
  source.startsWith('service:') ? `${source.slice('service:'.length)} service page` : 'Contact page';

const buttonClass = 'rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60';

interface MessagesPanelProps {
  /** Called with the number of new messages, for the tab badge */
  onNewCount?: (count: number) => void;
}

const MessagesPanel: React.FC<MessagesPanelProps> = ({ onNewCount }) => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filter, setFilter] = useState<MessageStatus | 'all'>('new');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const load = async () => {
    setError('');
    try {
      const list = await adminListMessages();
      setMessages(list);
      onNewCount?.(list.filter((m) => m.status === 'new').length);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (message: ContactMessage, status: MessageStatus) => {
    setBusyId(message.id);
    setError('');
    try {
      await adminSetMessageStatus(message.id, status);
      const updated = messages.map((m) => (m.id === message.id ? { ...m, status } : m));
      setMessages(updated);
      onNewCount?.(updated.filter((m) => m.status === 'new').length);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const startReply = (message: ContactMessage) => {
    setReplyingId(message.id);
    setReplyText(`Hello ${message.name.split(' ')[0]},\n\nThank you for contacting Agro Aerial Precision.\n\n`);
    setNotice('');
    setError('');
  };

  const sendReply = async (message: ContactMessage) => {
    setBusyId(message.id);
    setError('');
    try {
      const result = await adminReplyMessage(message.id, replyText);
      const updated = messages.map((m) =>
        m.id === message.id ? { ...m, status: result.status, replyText: result.replyText, repliedAt: result.repliedAt } : m
      );
      setMessages(updated);
      onNewCount?.(updated.filter((m) => m.status === 'new').length);
      setReplyingId(null);
      setReplyText('');
      setNotice(`Reply sent to ${message.email}. A copy was sent to your info@ inbox.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setNotice(`Copied ${email}`);
    } catch {
      setNotice(email);
    }
  };

  const visible = filter === 'all' ? messages : messages.filter((m) => m.status === filter);
  const count = (key: MessageStatus | 'all') => (key === 'all' ? messages.length : messages.filter((m) => m.status === key).length);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-green-900">Messages</h2>
        <button type="button" onClick={load} className={`${buttonClass} border border-green-700 text-green-800 hover:bg-green-50`}>
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={filter === key}
            onClick={() => setFilter(key)}
            className={`${buttonClass} ${filter === key ? 'bg-green-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            {label} ({count(key)})
          </button>
        ))}
      </div>

      {error && <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800">{notice}</div>}

      {loading ? (
        <p className="text-slate-500">Loading messages...</p>
      ) : visible.length === 0 ? (
        <p className="text-slate-500">{filter === 'new' ? 'No new messages.' : 'No messages here.'}</p>
      ) : (
        <ul className="space-y-3">
          {visible.map((message) => {
            const phoneDigits = message.phone.replace(/[^0-9]/g, '');
            const replySubject = encodeURIComponent(`Re: ${message.subject}`);
            const replyBody = encodeURIComponent(`Hello ${message.name.split(' ')[0]},\n\n\n\n---\nYour message:\n${message.message}`);
            return (
              <li key={message.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900">{message.subject}</p>
                    <p className="text-sm text-slate-600">
                      {message.name} · <span className="break-all">{message.email}</span>
                      {message.phone && <> · {message.phone}</>}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(message.createdAt).toLocaleString()} · {sourceLabel(message.source)}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_STYLES[message.status]}`}>{message.status}</span>
                </div>

                <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-800">{message.message}</p>

                {message.replyText && (
                  <div className="mt-3 rounded-lg border-l-4 border-green-600 bg-green-50 p-3 text-sm">
                    <p className="mb-1 text-xs font-semibold text-green-800">
                      Your reply{message.repliedAt ? ` - ${new Date(message.repliedAt).toLocaleString()}` : ''}
                    </p>
                    <p className="whitespace-pre-wrap text-slate-800">{message.replyText}</p>
                  </div>
                )}

                {replyingId === message.id && (
                  <div className="mt-3 space-y-2">
                    <label htmlFor={`reply-${message.id}`} className="block text-sm font-semibold text-slate-700">
                      Reply to {message.email}
                    </label>
                    <textarea
                      id={`reply-${message.id}`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={7}
                      maxLength={10000}
                      className="block w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-green-700 focus:outline-none"
                    />
                    <p className="text-xs text-slate-500">Sent from info@agroaerialprecision.com with your contact details added. A copy goes to your info@ inbox.</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => sendReply(message)}
                        disabled={busyId === message.id || !replyText.trim()}
                        className={`${buttonClass} bg-green-700 text-white hover:bg-green-800`}
                      >
                        {busyId === message.id ? 'Sending...' : 'Send reply'}
                      </button>
                      <button type="button" onClick={() => setReplyingId(null)} className={`${buttonClass} border border-slate-300 text-slate-700 hover:bg-slate-100`}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {replyingId !== message.id && (
                    <button type="button" onClick={() => startReply(message)} className={`${buttonClass} bg-green-700 text-white hover:bg-green-800`}>
                      {message.replyText ? 'Reply again' : 'Reply'}
                    </button>
                  )}
                  <button type="button" onClick={() => copyEmail(message.email)} className={`${buttonClass} border border-slate-300 text-slate-700 hover:bg-slate-100`}>
                    Copy email
                  </button>
                  <a
                    href={`mailto:${message.email}?subject=${replySubject}&body=${replyBody}`}
                    className={`${buttonClass} border border-slate-300 text-slate-700 hover:bg-slate-100`}
                    title="Opens the email program installed on this computer, if there is one"
                  >
                    Open in email app
                  </a>
                  {phoneDigits && (
                    <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener noreferrer" className={`${buttonClass} border border-green-700 text-green-800 hover:bg-green-50`}>
                      WhatsApp
                    </a>
                  )}
                  {message.status !== 'replied' && (
                    <button type="button" disabled={busyId === message.id} onClick={() => setStatus(message, 'replied')} className={`${buttonClass} border border-slate-300 text-slate-700 hover:bg-slate-100`}>
                      Mark replied
                    </button>
                  )}
                  {message.status !== 'archived' ? (
                    <button type="button" disabled={busyId === message.id} onClick={() => setStatus(message, 'archived')} className={`${buttonClass} border border-slate-300 text-slate-700 hover:bg-slate-100`}>
                      Archive
                    </button>
                  ) : (
                    <button type="button" disabled={busyId === message.id} onClick={() => setStatus(message, 'new')} className={`${buttonClass} border border-slate-300 text-slate-700 hover:bg-slate-100`}>
                      Move back to New
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MessagesPanel;
