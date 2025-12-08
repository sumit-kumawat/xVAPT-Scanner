import React, { useState } from 'react';
import { SystemLog } from '../types';
import { ScrollText, Search, Filter, Shield } from 'lucide-react';

interface LogsPageProps {
  logs: SystemLog[];
}

export const LogsPage: React.FC<LogsPageProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'All' | 'Success' | 'Failed' | 'Warning'>('All');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.includes(searchTerm) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'All' || log.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/20 p-2 rounded-lg">
            <ScrollText className="text-blue-400 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">System Logs</h2>
            <p className="text-slate-400 text-sm">Audit trail of system access and operations</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by IP, User, or Action..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-[#4285F4] focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-1">
          {['All', 'Success', 'Warning', 'Failed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === f 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-400">
            <thead className="bg-slate-950 text-slate-300 text-xs uppercase font-semibold tracking-wide">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Public IP</th>
                <th className="px-6 py-4">User Identity</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No logs found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-3 font-mono text-xs text-slate-500">{log.timestamp}</td>
                    <td className="px-6 py-3 font-mono text-sm text-blue-400">{log.ip}</td>
                    <td className="px-6 py-3">
                      <span className="text-slate-300 font-medium">{log.user}</span>
                    </td>
                    <td className="px-6 py-3 text-sm">{log.action}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.status === 'Success' ? 'bg-green-500/10 text-green-400' :
                        log.status === 'Warning' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 text-xs text-slate-500 flex justify-between">
           <span>Showing {filteredLogs.length} records</span>
           <span>Live Stream Active</span>
        </div>
      </div>
    </div>
  );
};
