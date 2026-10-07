import React from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  FileText, 
  UserPlus, 
  Activity, 
  RotateCw, 
  Zap, 
  Edit3, 
  Eye, 
  ArrowRight,
  TrendingUp,
  Stethoscope
} from 'lucide-react';
import { DashboardStats, Appointment } from '../types';

interface DashboardProps {
  stats: DashboardStats | null;
  loading: boolean;
  onRefresh: () => void;
  onResetDemo: () => void;
  onNavigate: (tab: string) => void;
  onOpenAddPatient: () => void;
  onOpenAddDoctor: () => void;
  onOpenBookAppointment: () => void;
  onEditAppointment: (apt: Appointment) => void;
  onViewPatientHistory: (patientId: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  loading,
  onRefresh,
  onResetDemo,
  onNavigate,
  onOpenAddPatient,
  onOpenAddDoctor,
  onOpenBookAppointment,
  onEditAppointment,
  onViewPatientHistory,
}) => {
  // Format current date nicely
  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Hospital Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Today is {formattedToday}. Real-time clinic stream.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-2xs transition"
          >
            <RotateCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={onResetDemo}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-2xs transition"
            title="Re-seed SQLite database with default demonstration dataset"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Enrich Demo Data</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Patients */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +14% MoM
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-500 mb-1">
            Total Patients Registered
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats?.totalPatients ?? 0}
          </div>
        </div>

        {/* Licensed Doctors */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              Active Staff
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-500 mb-1">
            Licensed Doctors
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats?.totalDoctors ?? 0}
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
              Today's Queue
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-500 mb-1">
            Today's Appointments
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats?.todayAppointments ?? 0}
          </div>
        </div>

        {/* Total Prescriptions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              Fulfilled
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-500 mb-1">
            Total Prescriptions
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats?.totalPrescriptions ?? 0}
          </div>
        </div>
      </div>

      {/* Main Grid: Left (Appointments) & Right (Quick Actions + Specializations) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent & Upcoming Appointments (approx 2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Recent & Upcoming Appointments
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time schedule synchronizing across hospital desks
              </p>
            </div>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-bold uppercase text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="pb-3 px-2">ID</th>
                  <th className="pb-3 px-3">Patient</th>
                  <th className="pb-3 px-3">Assigned Doctor</th>
                  <th className="pb-3 px-3">Date & Time</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {stats?.recentAppointments && stats.recentAppointments.length > 0 ? (
                  stats.recentAppointments.map((apt) => {
                    const initials = apt.patient_name
                      ? apt.patient_name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                      : 'PT';

                    return (
                      <tr key={apt.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-2 font-mono text-slate-400">#{apt.id}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{apt.patient_name}</div>
                              <div className="text-[11px] text-slate-400">{apt.patient_phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div>
                            <div className="font-medium text-slate-900">{apt.doctor_name}</div>
                            <div className="text-[11px] text-slate-500">{apt.doctor_specialization}</div>
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-slate-700 font-mono text-[11px]">
                          {apt.date} {apt.time}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              apt.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : apt.status === 'Cancelled'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-sky-50 text-sky-700 border border-sky-200'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onEditAppointment(apt)}
                              title="Edit Appointment"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onViewPatientHistory(apt.patient_id)}
                              title="View Patient Timeline"
                              className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                            >
                              <Activity className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No appointments recorded. Click "Book Appointment" to schedule consultations.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Quick Actions + Active Specializations */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onOpenAddPatient}
                className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 text-slate-700 hover:text-sky-700 transition flex flex-col items-center justify-center gap-2 group text-center"
              >
                <div className="w-9 h-9 rounded-lg bg-sky-50 group-hover:bg-sky-100 text-sky-600 flex items-center justify-center transition">
                  <UserPlus className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold">Add Patient</span>
              </button>

              <button
                onClick={onOpenAddDoctor}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-700 hover:text-indigo-700 transition flex flex-col items-center justify-center gap-2 group text-center"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition">
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold">Add Doctor</span>
              </button>

              <button
                onClick={onOpenBookAppointment}
                className="p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 text-slate-700 hover:text-amber-700 transition flex flex-col items-center justify-center gap-2 group text-center"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-50 group-hover:bg-amber-100 text-amber-600 flex items-center justify-center transition">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold">Schedule</span>
              </button>

              <button
                onClick={() => onNavigate('bmi')}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-slate-700 hover:text-emerald-700 transition flex flex-col items-center justify-center gap-2 group text-center"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold">BMI Studio</span>
              </button>
            </div>
          </div>

          {/* Active Specializations Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 mb-4">
              <Stethoscope className="w-4 h-4 text-sky-600" />
              <h2 className="text-base font-bold text-slate-900">
                Active Specializations
              </h2>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {stats?.specializations && stats.specializations.length > 0 ? (
                stats.specializations.map((spec) => (
                  <div
                    key={spec.specialization}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 text-xs transition"
                  >
                    <div className="flex items-center gap-2 font-medium text-slate-800">
                      <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                      <span>{spec.specialization}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-[11px] border border-indigo-100">
                      ● {spec.doctor_count} {spec.doctor_count === 1 ? 'Doctor' : 'Doctors'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No active specializations.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
