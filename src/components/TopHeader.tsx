import React, { useState, useEffect } from 'react';
import { Search, Plus, Moon, Sun, Menu, Database } from 'lucide-react';

interface TopHeaderProps {
  onOpenBookAppointment: () => void;
  onOpenMobileSidebar: () => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  onSelectSearchItem?: (type: 'patient' | 'doctor' | 'appointment', id: number) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenBookAppointment,
  onOpenMobileSidebar,
  globalSearch,
  setGlobalSearch,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between gap-4 transition-colors">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Mobile menu button */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global search input */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="global-search-input"
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search patients, doctors, or appointments (Ctrl+K)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-800 placeholder-slate-400 border border-slate-200/90 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition shadow-2xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {/* SQLite Active status badge matching screenshot */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Database className="w-3.5 h-3.5 text-emerald-600 inline" />
          <span>SQLite Active</span>
        </div>

        {/* Theme indicator */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          title="Toggle light/dark contrast"
          className="p-2.5 rounded-xl border border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Book Appointment CTA matching screenshot */}
        <button
          onClick={onOpenBookAppointment}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all hover:shadow-lg hover:shadow-sky-600/30"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Book Appointment</span>
        </button>
      </div>
    </header>
  );
};
