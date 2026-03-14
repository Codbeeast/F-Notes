import React, { useEffect } from 'react';

export default function PopNotification({ type = 'info', message, onClose, duration = 3500 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const colors = {
    error: 'bg-red-600 border-red-400 text-white',
    warning: 'bg-yellow-500 border-yellow-300 text-black',
    info: 'bg-blue-600 border-blue-400 text-white',
    success: 'bg-green-600 border-green-400 text-white',
  };

  return (
    <div
      className={`fixed top-6 right-6 z-[9999] min-w-[260px] max-w-xs px-5 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-pop-in ${colors[type]}`}
      style={{ animation: 'pop-in 0.4s cubic-bezier(.17,.67,.83,.67)' }}
      role="alert"
    >
      <span className="font-bold text-lg">
        {type === 'error' && '❌'}
        {type === 'warning' && '⚠️'}
        {type === 'info' && 'ℹ️'}
        {type === 'success' && '✅'}
      </span>
      <span className="flex-1 text-base font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-xl font-bold hover:scale-125 transition-transform"
        aria-label="Close notification"
      >
        ×
      </button>
      <style>{`
        @keyframes pop-in {
          0% { opacity: 0; transform: translateY(-30px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
