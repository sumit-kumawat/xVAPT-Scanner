import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, title, message, confirmText = "Confirm", cancelText = "Cancel", isDanger = false, onConfirm, onCancel, children
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-sm w-full shadow-2xl relative transform transition-all scale-100">
         <div className="text-center">
           <div className={`p-4 rounded-full inline-block mb-4 shadow-lg ${isDanger ? 'bg-red-900/20 text-red-500 shadow-red-900/10' : 'bg-blue-900/20 text-blue-500 shadow-blue-900/10'}`}>
             <AlertTriangle size={32} />
           </div>
           <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
           <p className="text-slate-400 text-sm mb-6 leading-relaxed">{message}</p>
           
           {children && <div className="mb-6 text-left">{children}</div>}

           <div className="flex gap-3">
             <button onClick={onCancel} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-medium transition-colors">
               {cancelText}
             </button>
             <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-lg text-white font-bold shadow-lg transition-colors ${isDanger ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'}`}>
               {confirmText}
             </button>
           </div>
         </div>
      </div>
    </div>
  );
};