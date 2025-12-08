
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Terminal } from './components/Terminal';
import { Dashboard } from './components/Dashboard';
import { SettingsPage } from './components/Settings';
import { HistoryPage } from './components/History';
import { LogsPage } from './components/Logs';
import { Login } from './components/Login';
import { ToastContainer } from './components/Toast';
import { ProfileModal } from './components/ProfileModal';
import { ScanStatus, LogEntry, Vulnerability, Severity, User, Client, UserRole, ScanResult, Notification, SystemLog } from './types';
import { generateScanLog, VAPT_CHECKLIST, getSmartInsight } from './services/scannerEngine';
import { generateExecutiveSummary, analyzeTargetForVulnerabilities } from './services/geminiService';
import { generatePDFReport } from './services/pdfService';
import { Menu, Play, Download, RefreshCw, Globe, FileText, CheckCircle, LogOut, User as UserIcon, Loader2, BrainCircuit, Activity, ChevronDown, Lock } from 'lucide-react';

// Helper for bold markdown parsing in reports
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  // Split by double newlines for paragraphs to keep spacing
  const paragraphs = text.split('\n\n');
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      {paragraphs.map((para, i) => (
        <p key={i}>
          {para.split(/(\*\*.*?\*\*)/g).map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              // Remove markers and render bold
              return <strong key={j} className="text-white font-bold">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      ))}
    </div>
  );
};

export default function App() {
  // -- AUTH STATE --
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'admin', email: 'admin@conzex.com', password: 'admin', role: UserRole.ADMIN, isTempPassword: false },
    { id: '2', username: 'manager', email: 'manager@conzex.com', password: 'password', role: UserRole.MANAGER, isTempPassword: true },
  ]);

  // -- DATA STATE --
  const [clients, setClients] = useState<Client[]>([
    { id: '1', name: 'Acme Corp', domain: 'acme.com', contactEmail: 'security@acme.com', phone: '+1 555-0199', address: '123 Cyber Way', contactPerson: 'John Doe' }
  ]);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // -- UI STATE --
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); 
  const phasesScrollRef = useRef<HTMLDivElement>(null);
  
  // -- SCANNER STATE --
  const [targetUrl, setTargetUrl] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [status, setStatus] = useState<ScanStatus>(ScanStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [findings, setFindings] = useState<Vulnerability[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [currentInsight, setCurrentInsight] = useState<string>("Ready for analysis...");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanStepRef = useRef(0);

  // -- GENERATE MOCK SYSTEM LOGS --
  useEffect(() => {
    const generateLogs = () => {
      const actions = [
        'User Login', 'Scan Initiated', 'Report Downloaded', 'Settings Updated', 'User Logout', 'Failed Login Attempt', 'Client Profile Updated'
      ];
      const statuses = ['Success', 'Success', 'Success', 'Success', 'Warning', 'Failed'] as const;
      const usersList = ['admin', 'manager', 'system_bot', 'admin', 'unknown'];
      
      // Helper for random IP
      const rIp = () => `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;

      const newLogs: SystemLog[] = Array.from({ length: 25 }).map((_, i) => ({
        id: `log-${i}`,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toLocaleString(),
        ip: rIp(),
        user: usersList[Math.floor(Math.random() * usersList.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)]
      })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setSystemLogs(newLogs);
    };

    generateLogs();
  }, []);

  // -- AUTO SCROLL EFFECT --
  useEffect(() => {
    if (status === ScanStatus.RUNNING && phasesScrollRef.current) {
      // Calculate active phase index
      const activeIndex = Math.floor((progress / 100) * VAPT_CHECKLIST.length);
      const activeElement = document.getElementById(`phase-${activeIndex}`);
      
      if (activeElement) {
        // Use 'nearest' to avoid page jump, 'center' to keep it visible in container
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [progress, status]);

  // -- NOTIFICATION HELPER --
  const addNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  // -- LOGIN HANDLER --
  const handleLogin = (username: string, password?: string) => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (user && user.password === password) {
      setCurrentUser(user);
      addNotification('success', `Welcome back, ${user.username}`);
      
      // Log login action
      setSystemLogs(prev => [{
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        ip: '192.168.1.105', // Local/User IP
        user: user.username,
        action: 'User Login',
        status: 'Success'
      }, ...prev]);

      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    setCurrentUser(null);
    setStatus(ScanStatus.IDLE);
    setLogs([]);
    setFindings([]);
    setTargetUrl('');
  };

  const handleUpdatePassword = (newPassword: string) => {
    if (!currentUser) return;
    
    setUsers(prev => prev.map(u => 
      u.id === currentUser.id ? { ...u, password: newPassword, isTempPassword: false } : u
    ));
    setCurrentUser(prev => prev ? { ...prev, password: newPassword, isTempPassword: false } : null);
    addNotification('success', 'Password updated successfully.');
  };

  // -- SCAN LOGIC --
  const startScan = async () => {
    if (!targetUrl) {
       addNotification('error', "Target URL is required.");
       return;
    }
    if (currentUser?.role === UserRole.VIEWER) {
      addNotification('error', "Insufficient permissions to initiate scans.");
      return;
    }

    setStatus(ScanStatus.RUNNING);
    setProgress(0);
    setLogs([]);
    setFindings([]); 
    setAiSummary(null);
    scanStepRef.current = 0;
    setCurrentView('scanner'); 
    setCurrentInsight("Initializing Neural Engine...");

    setLogs([{ timestamp: new Date().toLocaleTimeString(), tool: 'System', message: `Initializing VAPT Engine for ${targetUrl}`, type: 'info' }]);
    
    // Add System Log
    setSystemLogs(prev => [{
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      ip: '192.168.1.105',
      user: currentUser?.username || 'unknown',
      action: `Initiated Scan: ${targetUrl}`,
      status: 'Success'
    }, ...prev]);

    const totalSteps = 100;

    intervalRef.current = setInterval(async () => {
      scanStepRef.current += 1;
      const step = scanStepRef.current;
      setProgress(Math.min((step / totalSteps) * 100, 100));

      const newLog = generateScanLog(step, targetUrl, totalSteps);
      setLogs(prev => [...prev.slice(-49), newLog]);

      // Update Intelligence
      if (step % 5 === 0) {
        setCurrentInsight(getSmartInsight(step, totalSteps, targetUrl));
      }

      if (step >= totalSteps) {
        clearInterval(intervalRef.current!);
        
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), tool: 'System', message: 'Engine Cycle Complete. Analyzing Vectors...', type: 'warning' }]);
        setCurrentInsight("Finalizing Report & Risk Scoring...");
        
        try {
          const detectedFindings = await analyzeTargetForVulnerabilities(targetUrl);
          setFindings(detectedFindings);
          
          const summary = await generateExecutiveSummary(targetUrl, detectedFindings);
          setAiSummary(summary);

          const clientName = clients.find(c => c.id === selectedClient)?.name || 'Unknown';
          const newRecord: ScanResult = {
            id: Date.now().toString(),
            targetUrl,
            date: new Date().toISOString().split('T')[0],
            duration: '8m 42s',
            findings: detectedFindings,
            logs: [],
            aiSummary: summary,
            clientName,
            clientId: selectedClient
          };
          setScanHistory(prev => [newRecord, ...prev]);

          setStatus(ScanStatus.COMPLETED);
          setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), tool: 'System', message: 'Analysis Complete. Report Ready.', type: 'success' }]);
          setCurrentInsight("Scan Completed Successfully.");
          addNotification('success', 'VAPT Scan completed successfully.');

        } catch (e) {
          setStatus(ScanStatus.FAILED);
          setCurrentInsight("Analysis Failed.");
          addNotification('error', 'Analysis Engine failed to generate report.');
        }
      }
    }, 150); 
  };

  const stopScan = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStatus(ScanStatus.IDLE);
    setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), tool: 'System', message: 'Process Terminated by User.', type: 'error' }]);
    setCurrentInsight("Process Aborted.");
    addNotification('warning', 'Scan aborted.');
  };

  const handleDownloadPDF = () => {
    if (status !== ScanStatus.COMPLETED) return;
    const currentResult: ScanResult = {
      id: 'current',
      targetUrl,
      date: new Date().toLocaleDateString(),
      duration: 'N/A',
      findings,
      logs: [],
      aiSummary: aiSummary || '',
      clientName: clients.find(c => c.id === selectedClient)?.name
    };
    generatePDFReport(currentResult);
    
    setSystemLogs(prev => [{
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      ip: '192.168.1.105',
      user: currentUser?.username || 'unknown',
      action: `Downloaded Report: ${targetUrl}`,
      status: 'Success'
    }, ...prev]);
  };

  const handleVerifyVulnerability = (id: string) => {
    setFindings(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, verified: true };
      }
      return f;
    }));
    addNotification('success', 'Vulnerability verified and status updated.');
  };

  const handleDeleteClientData = (clientId: string, cascade: boolean) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
    if (cascade) {
      setScanHistory(prev => prev.filter(s => s.clientId !== clientId));
    }
  };

  // -- RENDER --
  if (!currentUser) {
    return (
      <>
        <ToastContainer notifications={notifications} onDismiss={id => setNotifications(n => n.filter(x => x.id !== id))} />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  const visibleClients = currentUser.role === UserRole.VIEWER 
    ? clients.filter(c => c.id === currentUser.assignedClientId)
    : clients;
  
  const visibleHistory = currentUser.role === UserRole.VIEWER
    ? scanHistory.filter(h => h.clientId === currentUser.assignedClientId)
    : scanHistory;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans">
      <ToastContainer notifications={notifications} onDismiss={id => setNotifications(n => n.filter(x => x.id !== id))} />
      
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* HEADER */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 z-10 relative">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
            >
              <Menu />
            </button>
            <h2 className="text-lg font-semibold text-slate-200 capitalize">
              {currentView === 'settings' ? 'Global Settings' : 
               currentView === 'scanner' ? 'VAPT Engine' :
               currentView === 'history' ? 'Scan History' :
               currentView === 'logs' ? 'System Logs' :
               currentView.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-6 relative">
            <div 
              className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700 relative z-50"
              onClick={(e) => {
                e.stopPropagation();
                setIsUserMenuOpen(!isUserMenuOpen);
              }}
            >
              <div className="text-right hidden md:block">
                <div className="text-sm font-bold text-slate-200">{currentUser.username}</div>
                <div className="text-xs text-[#4285F4]">{currentUser.role}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-[#4285F4] flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                {currentUser.username[0].toUpperCase()}
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 animate-fade-in z-[60]">
                <button 
                  onClick={() => { setIsUserMenuOpen(false); setIsProfileModalOpen(true); }}
                  className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                >
                  <UserIcon size={16} className="text-[#4285F4]" /> My Profile
                </button>
                <div className="h-px bg-slate-800 my-1"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 flex items-center gap-2"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
            
            {/* Click outside closer overlay */}
            {isUserMenuOpen && (
              <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
            )}
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="max-w-7xl mx-auto">
            
            {currentView === 'dashboard' && (
              <Dashboard 
                findings={visibleHistory.flatMap(s => s.findings).concat(findings.length > 0 ? findings : [])} 
                onVerify={handleVerifyVulnerability} 
                targetUrl={targetUrl}
              />
            )}

            {currentView === 'scanner' && (
              <div className="space-y-6 animate-fade-in">
                {currentUser.role === UserRole.VIEWER ? (
                  <div className="p-8 text-center bg-slate-900 rounded-xl border border-slate-800">
                    <UserIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-300">Access Restricted</h3>
                    <p className="text-slate-500">Viewer accounts cannot initiate scans.</p>
                  </div>
                ) : (
                  <>
                  {/* CONFIG PANEL */}
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Target URL</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                          <input 
                            type="text" 
                            value={targetUrl}
                            onChange={(e) => setTargetUrl(e.target.value)}
                            placeholder="https://target-domain.com"
                            disabled={status === ScanStatus.RUNNING}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-[#4285F4] font-mono"
                          />
                        </div>
                      </div>
                      
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Client Context</label>
                        <select 
                          value={selectedClient}
                          onChange={(e) => setSelectedClient(e.target.value)}
                          disabled={status === ScanStatus.RUNNING}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-[#4285F4]"
                        >
                           <option value="">-- Select Client --</option>
                           {visibleClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>

                      <div className="md:col-span-3">
                         <label className="block text-sm font-medium text-slate-400 mb-2">Control</label>
                         {status === ScanStatus.RUNNING ? (
                           <button onClick={stopScan} className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium shadow-lg shadow-red-900/20">Abort Process</button>
                         ) : (
                           <button onClick={startScan} className="w-full bg-gradient-to-r from-blue-700 to-[#4285F4] hover:opacity-90 text-white py-2.5 rounded-lg font-medium flex justify-center items-center gap-2 shadow-lg shadow-blue-900/20">
                             <Play size={18} /> Initiate Scan
                           </button>
                         )}
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE SCAN VIEW */}
                  {status !== ScanStatus.IDLE && (
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                       <div className="lg:col-span-2 space-y-4">
                          {/* INTELLIGENCE PANEL */}
                          <div className="bg-slate-900/80 border border-[#4285F4]/30 p-4 rounded-xl shadow-lg relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-1 h-full bg-[#4285F4] animate-pulse"></div>
                             <div className="flex items-center gap-3 mb-2">
                               <BrainCircuit className="text-[#4285F4] animate-pulse" size={20} />
                               <h3 className="text-sm font-bold text-white tracking-wide uppercase">Neural Engine Analysis</h3>
                             </div>
                             <p className="text-blue-200 font-mono text-sm leading-relaxed typing-cursor">
                               {currentInsight}
                             </p>
                             <div className="absolute bottom-2 right-4 flex gap-1">
                               <div className="w-1 h-1 bg-[#4285F4] rounded-full animate-bounce delay-75"></div>
                               <div className="w-1 h-1 bg-[#4285F4] rounded-full animate-bounce delay-150"></div>
                               <div className="w-1 h-1 bg-[#4285F4] rounded-full animate-bounce delay-300"></div>
                             </div>
                          </div>
                          
                          <Terminal logs={logs} />
                       </div>
                       
                       <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl h-[480px] flex flex-col shadow-lg">
                          <h3 className="text-sm font-bold text-slate-300 mb-3 border-b border-slate-700 pb-2 flex items-center gap-2 flex-shrink-0">
                             <Activity size={16} className={status === ScanStatus.RUNNING ? "animate-spin text-[#4285F4]" : "text-green-500"}/>
                             Execution Phases
                          </h3>
                          <div className="space-y-2 overflow-y-auto flex-1 pr-1 terminal-scroll" ref={phasesScrollRef}>
                             {VAPT_CHECKLIST.map((item, index) => {
                               const isDone = progress >= ((index + 1) * (100 / VAPT_CHECKLIST.length));
                               const isActive = !isDone && progress >= (index * (100 / VAPT_CHECKLIST.length));
                               
                               return (
                                 <div 
                                    key={index} 
                                    id={`phase-${index}`}
                                    className={`flex items-center gap-2 text-xs p-2 rounded transition-all duration-300 
                                      ${isActive ? 'bg-[#4285F4]/20 border border-[#4285F4]/30 shadow-lg scale-105 my-1' : ''}
                                      ${isDone ? 'bg-slate-800/50 text-slate-500' : 'text-slate-400'}
                                    `}
                                 >
                                    {isDone ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0"/> : 
                                     isActive ? <Loader2 className="w-4 h-4 text-[#4285F4] animate-spin flex-shrink-0"/> :
                                     <div className="w-4 h-4 rounded-full border border-slate-600 flex-shrink-0"/>}
                                    <span className={`font-mono ${isActive ? 'text-white font-bold' : ''}`}>{item.label}</span>
                                 </div>
                               );
                             })}
                          </div>
                       </div>
                     </div>
                  )}

                  {/* SCAN COMPLETE ACTIONS */}
                  {status === ScanStatus.COMPLETED && (
                    <div className="flex justify-end animate-fade-in">
                      <button 
                        onClick={() => setCurrentView('history')}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:opacity-90 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-emerald-500/20 transition-all"
                      >
                        <FileText size={18} /> View Full Report
                      </button>
                    </div>
                  )}
                  </>
                )}
              </div>
            )}

            {currentView === 'history' && (
              <HistoryPage 
                history={visibleHistory} 
                onDelete={(id) => {
                  if (currentUser.role === UserRole.VIEWER) {
                    addNotification('error', 'Viewers cannot delete history.');
                    return;
                  }
                  setScanHistory(prev => prev.filter(p => p.id !== id));
                  addNotification('info', 'Report deleted.');
                }} 
              />
            )}

            {currentView === 'logs' && (
              <LogsPage logs={systemLogs} />
            )}

            {currentView === 'settings' && (
              <SettingsPage 
                currentUser={currentUser}
                users={users} setUsers={setUsers}
                clients={clients} setClients={setClients}
                onNotify={addNotification}
                onDeleteClientData={handleDeleteClientData}
                onUpdatePassword={handleUpdatePassword}
              />
            )}

          </div>
        </main>

        {/* FOOTER BRANDING */}
        <footer className="bg-slate-950 border-t border-slate-900 py-3 text-center">
           <p className="text-xs text-slate-600">
             &copy; 2021 - {new Date().getFullYear()} <span className="text-slate-500 font-bold">Conzex Global Private Limited</span>. All Rights Reserved.
           </p>
        </footer>
      </div>

      {/* PROFILE MODAL */}
      {isProfileModalOpen && (
        <ProfileModal 
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onUpdatePassword={handleUpdatePassword}
        />
      )}
    </div>
  );
}
