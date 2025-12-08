
import React, { useState } from 'react';
import { User } from '../types';
import { X, Lock, Save, User as UserIcon, Shield } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdatePassword: (password: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, currentUser, onUpdatePassword }) => {
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Simple validation
    if (passwordForm.current !== currentUser.password) {
      setMessage({ type: 'error', text: 'Current password is incorrect.' });
      return;
    }
    if (passwordForm.new.length < 5) {
      setMessage({ type: 'error', text: 'New password must be at least 5 characters.' });
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    onUpdatePassword(passwordForm.new);
    setMessage({ type: 'success', text: 'Password updated successfully.' });
    setPasswordForm({ current: '', new: '', confirm: '' });
    
    // Auto close after success
    setTimeout(() => {
      onClose();
      setMessage(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-950 p-6 border-b border-slate-800 flex justify-between items-start">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-[#4285F4] flex items-center justify-center text-3xl font-bold text-white shadow-lg border-2 border-slate-800">
               {currentUser.username[0].toUpperCase()}
             </div>
             <div>
               <h3 className="text-xl font-bold text-white">{currentUser.username}</h3>
               <p className="text-slate-400 text-sm">{currentUser.email}</p>
               <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-900/30 text-blue-400 border border-blue-900/50">
                 {currentUser.role}
               </span>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-6 bg-slate-800/50 rounded-lg p-4 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield size={12} /> Account Status
            </h4>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Account Type</span>
              <span className="text-white font-medium">Enterprise / {currentUser.role}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-slate-400">Two-Factor Auth</span>
              <span className="text-red-400 font-medium">Disabled</span>
            </div>
          </div>

          <h4 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Lock size={18} className="text-[#4285F4]"/> Change Password
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Current Password</label>
              <input 
                type="password" 
                value={passwordForm.current}
                onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#4285F4] transition-colors"
                placeholder="Enter current password"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">New Password</label>
                <input 
                  type="password" 
                  value={passwordForm.new}
                  onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#4285F4] transition-colors"
                  placeholder="Min 5 chars"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Confirm New</label>
                <input 
                  type="password" 
                  value={passwordForm.confirm}
                  onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#4285F4] transition-colors"
                  placeholder="Re-enter"
                />
              </div>
            </div>

            {message && (
              <div className={`text-xs p-3 rounded border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {message.text}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button type="submit" className="bg-gradient-to-r from-blue-700 to-[#4285F4] hover:opacity-90 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95">
                <Save size={16}/> Update Password
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
