
import React, { useState } from 'react';
import { Lock, User as UserIcon } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, password?: string) => boolean;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(username, password)) {
      setError('');
    } else {
      setError('Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#4285F4]/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[100px]" />

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#4285F4]/10 border border-slate-700 p-2">
            <img src="https://cdn.conzex.com/files/logo/logo-200x200.png" alt="Conzex Logo" className="w-full h-full rounded-xl object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">VAPT AutoScanner</h1>
          <p className="text-slate-400 text-sm">Enterprise Security Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Username</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-[#4285F4] focus:border-transparent transition-all"
                placeholder="Enter username"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-[#4285F4] focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-blue-700 to-[#4285F4] hover:opacity-90 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-900/20"
          >
            Authenticate
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            Product of <span className="text-slate-300 font-semibold">Conzex Global Private Limited</span>
          </p>
          <a href="https://www.conzex.com" target="_blank" rel="noreferrer" className="text-xs text-[#4285F4] hover:underline mt-1 block">
            www.conzex.com
          </a>
        </div>
      </div>
    </div>
  );
};
