import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Calendar, 
  FileText, 
  Activity, 
  LogOut,
  Plus
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  counts: {
    patients: number;
    doctors: number;
    appointments: number;
    prescriptions: number;
  };
  currentUser: User | null;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  counts,
  currentUser,
  onLogout,
  isOpenMobile,
  onCloseMobile,
}) => {
  const coreNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users, badge: counts.patients },
    { id: 'doctors', label: 'Doctors', icon: UserCheck, badge: counts.doctors },
    { id: 'appointments', label: 'Appointments', icon: Calendar, badge: counts.appointments },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
  ];

  const clinicalNav = [
    { id: 'bmi', label: 'BMI & Health Studio', icon: Activity },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0a1128] text-slate-200 flex flex-col border-r border-slate-800/80 transition-transform duration-200 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-20 flex items-center px-6 gap-3.5 border-b border-slate-800/60 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold">
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <div className="flex items-center tracking-tight text-lg font-black leading-none">
              <span className="text-white">MEDI</span>
              <span className="text-sky-400 ml-0.5">TRACK</span>
            </div>
            <p className="text-[10px] tracking-widest text-slate-400 font-semibold mt-1 uppercase">
              Healthcare System
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
          {/* Core Operations */}
          <div>
            <div className="px-3 mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Core Operations
            </div>
            <nav className="space-y-1">
              {coreNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Clinical Tools */}
          <div>
            <div className="px-3 mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Clinical Tools
            </div>
            <nav className="space-y-1">
              {clinicalNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-slate-800/70 bg-[#070d1e]/80 shrink-0">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
              {currentUser?.avatar_initials || 'JS'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">
                {currentUser?.name || 'Dr. John Sterling'}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {currentUser?.title || 'Chief Administrator'}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span>Logout / Switch User</span>
          </button>
        </div>
      </aside>
    </>
  );
};
