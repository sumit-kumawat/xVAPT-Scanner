
import React from 'react';
import { LayoutDashboard, Terminal, FileText, Settings, History, ScrollText } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scanner', label: 'Scanner Engine', icon: Terminal },
    { id: 'history', label: 'Scan History', icon: History }, // This now acts as the main "Reports" archive
    { id: 'logs', label: 'System Logs', icon: ScrollText },
    { id: 'settings', label: 'Global Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-30 h-full w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:block flex flex-col
      `}>
        <div className="p-6 flex flex-col items-center gap-4 border-b border-slate-800 bg-slate-950">
          <div className="bg-slate-800 p-2 rounded-xl shadow-lg shadow-[#4285F4]/10 w-16 h-16 flex items-center justify-center">
            <img src="https://cdn.conzex.com/files/logo/logo-200x200.png" alt="Conzex" className="w-full h-full object-contain rounded-lg" />
          </div>
          <div className="w-full text-center">
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-[#4285F4] to-blue-400 bg-clip-text text-transparent w-full tracking-tight">
              VAPT
            </h1>
            <div className="text-[10px] text-slate-500 tracking-[0.2em] font-medium mt-1">ENTERPRISE EDITION</div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            // Separate styles to avoid bleed
            const activeClass = "bg-blue-600/10 text-[#4285F4] border border-[#4285F4]/20 shadow-[0_0_15px_rgba(66,133,244,0.1)]";
            const inactiveClass = "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent";

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setIsOpen(false); 
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? activeClass : inactiveClass}`}
              >
                <Icon size={20} className={`transition-colors ${isActive ? 'text-[#4285F4]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4285F4] shadow-[0_0_8px_rgba(66,133,244,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
            <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Engine Status</p>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              <span className="text-sm text-slate-300 font-medium">System Online</span>
            </div>
            <div className="text-xs text-slate-500 font-mono">Ver: 3.1.2-PRO</div>
          </div>
        </div>
      </aside>
    </>
  );
};
