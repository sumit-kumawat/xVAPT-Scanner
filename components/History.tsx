import React, { useState } from 'react';
import { ScanResult, Severity } from '../types';
import { Download, Trash2, Calendar, ShieldAlert } from 'lucide-react';
import { generatePDFReport } from '../services/pdfService';
import { ConfirmModal } from './ConfirmModal';

interface HistoryProps {
  history: ScanResult[];
  onDelete: (id: string) => void;
}

export const HistoryPage: React.FC<HistoryProps> = ({ history, onDelete }) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600/20 p-2 rounded-lg">
          <Calendar className="text-blue-400 w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Scan History</h2>
          <p className="text-slate-400 text-sm">Archive of all performed vulnerability assessments</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
           <ShieldAlert className="w-16 h-16 text-slate-600 mx-auto mb-4" />
           <h3 className="text-xl font-bold text-slate-300">No History Found</h3>
           <p className="text-slate-500 mt-2">Completed scans will appear here automatically.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left text-slate-400">
            <thead className="bg-slate-950 text-slate-300 text-xs uppercase">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Target</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Findings</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map(scan => (
                <tr key={scan.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm">{scan.date}</td>
                  <td className="px-6 py-4 text-slate-200 font-medium">{scan.targetUrl}</td>
                  <td className="px-6 py-4 text-sm">{scan.clientName || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded">
                        {scan.findings.filter(f => f.severity === Severity.CRITICAL || f.severity === Severity.HIGH).length} High/Crit
                      </span>
                      <span className="text-slate-500 text-xs">
                        {scan.findings.length} Total
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => generatePDFReport(scan)}
                        className="p-2 text-blue-400 hover:bg-blue-900/50 rounded-lg transition-colors"
                        title="Download PDF Report"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={() => setDeleteId(scan.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!deleteId}
        title="Delete Scan Report?"
        message="This will permanently remove this scan report and its associated findings from the database."
        isDanger={true}
        confirmText="Delete Report"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};