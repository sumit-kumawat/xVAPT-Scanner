import React, { useEffect } from 'react';
import { Notification } from '../types';
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

interface ToastProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {notifications.map(n => (
        <ToastItem key={n.id} notification={n} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ notification: Notification; onDismiss: (id: string) => void }> = ({ notification, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <AlertOctagon className="text-red-500" size={20} />,
    warning: <AlertTriangle className="text-orange-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />
  };

  const bgColors = {
    success: 'bg-slate-900 border-green-500/50',
    error: 'bg-slate-900 border-red-500/50',
    warning: 'bg-slate-900 border-orange-500/50',
    info: 'bg-slate-900 border-blue-500/50'
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg shadow-2xl border min-w-[300px] animate-fade-in ${bgColors[notification.type]}`}>
      {icons[notification.type]}
      <p className="flex-1 text-sm text-slate-200">{notification.message}</p>
      <button onClick={() => onDismiss(notification.id)} className="text-slate-500 hover:text-white">
        <X size={16} />
      </button>
    </div>
  );
};
