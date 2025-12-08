
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Vulnerability, Severity } from '../types';
import { ShieldCheck, RefreshCw, Terminal, X, Copy, AlertTriangle } from 'lucide-react';
import { generateProofOfConcept } from '../services/geminiService';

interface DashboardProps {
  findings: Vulnerability[];
  onVerify?: (vulnId: string) => void;
  targetUrl?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ findings, onVerify, targetUrl }) => {
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [testModalData, setTestModalData] = useState<{ vuln: Vulnerability, poc: { command: string, instructions: string } } | null>(null);

  const handleVerify = async (vuln: Vulnerability) => {
    if (!onVerify) return;
    setVerifyingId(vuln.id);
    
    // Generate PoC via AI for the specific target
    const poc = await generateProofOfConcept(vuln, targetUrl || 'the target');
    
    setTestModalData({ vuln, poc });
    setVerifyingId(null);
  };

  const confirmVerification = () => {
    if (testModalData && onVerify) {
      onVerify(testModalData.vuln.id);
      setTestModalData(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Aggregate data for severity
  const severityCounts = findings.reduce((acc, curr) => {
    acc[curr.severity] = (acc[curr.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: Severity.CRITICAL, value: severityCounts[Severity.CRITICAL] || 0, color: '#f43f5e' },
    { name: Severity.HIGH, value: severityCounts[Severity.HIGH] || 0, color: '#f97316' },
    { name: Severity.MEDIUM, value: severityCounts[Severity.MEDIUM] || 0, color: '#fbbf24' },
    { name: Severity.LOW, value: severityCounts[Severity.LOW] || 0, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  // Aggregate data for Categories
  const catCounts = findings.reduce((acc, curr) => {
    // Shorten category names for chart
    const shortName = curr.category.split(' ')[0].replace('&', ''); 
    acc[shortName] = (acc[shortName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.keys(catCounts).map(cat => ({
    name: cat,
    findings: catCounts[cat]
  }));

  const displayPieData = pieData.length > 0 ? pieData : [
    { name: 'Safe', value: 1, color: '#10b981' }
  ];

  return (
    <div className="space-y-6 animate-fade-in relative pb-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Findings" value={findings.length} subtitle="Active Vulnerabilities" />
        <StatCard title="Critical Risks" value={severityCounts[Severity.CRITICAL] || 0} subtitle="Immediate Action Required" color="text-red-500" />
        <StatCard title="High Risks" value={severityCounts[Severity.HIGH] || 0} subtitle="Priority Remediation" color="text-orange-500" />
        <StatCard title="Verified" value={findings.filter(f => f.verified).length} subtitle="Confirmed via PoC" color="text-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Risk Severity Distribution</h3>
          <div className="h-64 flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {displayPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} 
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Vulnerabilities by Category</h3>
          <div className="h-64 flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData.length ? barData : [{name: 'None', findings: 0}]}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-20} textAnchor="end" height={50} />
                <YAxis stroke="#64748b" />
                <Tooltip 
                   cursor={{fill: '#334155', opacity: 0.2}}
                   contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                />
                <Bar dataKey="findings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg overflow-hidden">
         <h3 className="text-lg font-semibold mb-4 text-slate-200">Live Findings & Validation</h3>
         <div className="overflow-x-auto">
           <table className="w-full text-sm text-left text-slate-400">
             <thead className="text-xs uppercase bg-slate-950 text-slate-300">
               <tr>
                 <th className="px-6 py-3 whitespace-nowrap">Severity</th>
                 <th className="px-6 py-3">Vulnerability / Tool</th>
                 <th className="px-6 py-3">Category</th>
                 <th className="px-6 py-3">Status</th>
                 <th className="px-6 py-3 text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-800">
               {findings.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">
                     No findings yet. Start a scan to populate data.
                   </td>
                 </tr>
               ) : (
                 findings.map((f) => (
                   <tr key={f.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${
                          f.severity === Severity.CRITICAL ? 'bg-red-500/20 text-red-500' :
                          f.severity === Severity.HIGH ? 'bg-orange-500/20 text-orange-500' :
                          f.severity === Severity.MEDIUM ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-blue-500/20 text-[#4285F4]'
                        }`}>
                          {f.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-200 text-base">{f.name}</div>
                        <div className="text-xs text-slate-500 mt-1 font-mono bg-slate-950 inline-block px-1.5 py-0.5 rounded border border-slate-800">{f.tool}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">{f.category}</td>
                      <td className="px-6 py-4">
                         {f.verified ? (
                           <span className="flex items-center gap-1.5 text-green-400 font-bold text-xs bg-green-500/10 px-2 py-1 rounded w-fit border border-green-500/20">
                             <ShieldCheck size={14}/> VERIFIED
                           </span>
                         ) : (
                           <span className="flex items-center gap-1.5 text-slate-500 text-xs italic">
                             <AlertTriangle size={14}/> Pending
                           </span>
                         )}
                      </td>
                      <td className="px-6 py-4 text-right">
                         {!f.verified && onVerify && (
                           <button 
                             onClick={() => handleVerify(f)}
                             disabled={verifyingId === f.id}
                             className="bg-slate-800 hover:bg-blue-600 text-[#4285F4] hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ml-auto border border-slate-700 hover:border-blue-500 whitespace-nowrap shadow-sm"
                           >
                             {verifyingId === f.id ? <RefreshCw size={14} className="animate-spin" /> : <><Terminal size={14}/> Test PoC</>}
                           </button>
                         )}
                      </td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
         </div>
      </div>

      {/* PoC MODAL */}
      {testModalData && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[90vh] animate-slide-up">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-xl">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Terminal className="text-[#4285F4]"/> Proof of Concept Generator
                </h3>
                <p className="text-sm text-slate-400 mt-1">Verify vulnerability: <span className="text-white font-medium">{testModalData.vuln.name}</span></p>
              </div>
              <button onClick={() => setTestModalData(null)} className="text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-slate-900/50">
              <div className="bg-black/80 rounded-lg p-4 border border-slate-800 font-mono text-sm mb-4 relative group shadow-inner">
                <div className="absolute top-2 left-3 text-[10px] text-slate-600 uppercase font-bold tracking-widest">Command Line</div>
                <button 
                  onClick={() => copyToClipboard(testModalData.poc.command)}
                  className="absolute top-2 right-2 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 p-1.5 rounded border border-slate-700"
                  title="Copy Command"
                >
                  <Copy size={14}/>
                </button>
                <code className="text-green-400 break-all block mt-4">{testModalData.poc.command}</code>
              </div>

              <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-4">
                <h4 className="text-sm font-bold text-[#4285F4] mb-2 flex items-center gap-2"><ShieldCheck size={16}/> Verification Instructions</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{testModalData.poc.instructions}</p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900 rounded-b-xl">
               <button onClick={() => setTestModalData(null)} className="px-4 py-2 text-slate-400 hover:text-white font-medium hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
               <button onClick={confirmVerification} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                 <ShieldCheck size={18}/> Confirm & Mark Verified
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const StatCard = ({ title, value, subtitle, color = "text-white" }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg hover:border-slate-700 transition-all hover:translate-y-[-2px]">
    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
    <p className={`text-4xl font-bold ${color}`}>{value}</p>
    <p className="text-slate-600 text-xs mt-2 font-medium flex items-center gap-1">
       {subtitle}
    </p>
  </div>
);
