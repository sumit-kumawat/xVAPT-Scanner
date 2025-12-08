import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface TerminalProps {
  logs: LogEntry[];
}

export const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-[#0f172a] rounded-lg border border-slate-700 font-mono text-sm shadow-2xl h-[400px] flex flex-col overflow-hidden">
      <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="ml-2 text-slate-400 text-xs">root@vapt-scanner:~# tail -f scan.log</span>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto terminal-scroll bg-black/40">
        {logs.length === 0 && (
          <div className="text-slate-500 italic">Waiting for scan initiation...</div>
        )}
        {logs.map((log, index) => (
          <div key={index} className="mb-1 break-words">
            <span className="text-slate-500">[{log.timestamp}]</span>{' '}
            <span className="text-blue-400 font-bold">[{log.tool}]</span>{' '}
            <span className={
              log.type === 'error' ? 'text-red-400' :
              log.type === 'success' ? 'text-green-400' :
              log.type === 'warning' ? 'text-yellow-400' : 'text-slate-300'
            }>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
        {logs.length > 0 && (
          <div className="mt-2 animate-blink text-green-500">_</div>
        )}
      </div>
    </div>
  );
};