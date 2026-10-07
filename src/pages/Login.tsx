import React, { useState } from 'react';
import { Plus, Mail, Lock, LogIn, ShieldCheck, Activity } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@meditrack.demo');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = () => {
    setEmail('admin@meditrack.demo');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-[#070d1e] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background ambient glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 relative z-10 border border-slate-100">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 mb-4">
            <Plus className="w-8 h-8 stroke-[3]" />
          </div>
          <div className="flex items-center text-2xl font-black tracking-tight text-slate-900">
            <span>MEDI</span>
            <span className="text-sky-600 ml-0.5">TRACK</span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
            Healthcare Management System
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Clinical Portal & Relational Health Database
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Staff Email / ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@meditrack.demo"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold text-sm rounded-xl shadow-lg shadow-sky-600/25 transition-all flex items-center justify-center gap-2 disabled:bg-sky-400"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>Access Clinical Portal</span>
          </button>
        </form>

        {/* 1-Click Demo Credentials Card */}
        <div className="mt-6 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Demo Credentials
            </span>
            <button
              type="button"
              onClick={handleUseDemo}
              className="text-sky-600 hover:text-sky-700 font-semibold underline"
            >
              Autofill
            </button>
          </div>
          <div className="text-slate-600 space-y-0.5 text-[11px] font-mono">
            <div>Email: <span className="text-slate-900 font-semibold">admin@meditrack.demo</span></div>
            <div>Password: <span className="text-slate-900 font-semibold">admin123</span></div>
          </div>
        </div>

        <div className="mt-6 text-center text-[11px] text-slate-400 leading-relaxed">
          MediTrack is an academic healthcare management prototype.<br />
          Built with React, Express, and persistent SQLite store.
        </div>
      </div>
    </div>
  );
};
