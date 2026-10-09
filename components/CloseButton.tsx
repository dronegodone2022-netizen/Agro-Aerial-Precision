import React, { useEffect } from 'react';

interface CloseButtonProps {
  onClose: () => void;
  label?: string;
  /** 'light' for dark/coloured headers, 'dark' for white backgrounds */
  tone?: 'light' | 'dark';
  className?: string;
}

/** Round "×" button used on every pop-up. Also closes the pop-up with the Esc key. */
const CloseButton: React.FC<CloseButtonProps> = ({ onClose, label = 'Close', tone = 'dark', className = '' }) => {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const colours =
    tone === 'light'
      ? 'bg-white/20 text-white hover:bg-white/35'
      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900';

  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-lime-500 ${colours} ${className}`}
    >
      <i className="ri-close-line text-xl" aria-hidden="true"></i>
    </button>
  );
};

export default CloseButton;
