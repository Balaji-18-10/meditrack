import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  RotateCw, 
  Check, 
  Edit3, 
  Trash2, 
  Clock, 
  User, 
  UserCheck 
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '../types';

interface AppointmentsProps {
  appointments: Appointment[];
  loading: boolean;
  onRefresh: () => void;
  onOpenBookAppointment: () => void;
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (appointment: Appointment) => void;
  onUpdateStatus: (id: number, status: AppointmentStatus) => void;
}

export const Appointments: React.FC<AppointmentsProps> = ({
  appointments,
  loading,
  onRefresh,
  onOpenBookAppointment,
  onEditAppointment,
  onDeleteAppointment,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('All');
    setSelectedDate('');
  };

  const filteredAppointments = appointments.filter((apt) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (apt.patient_name && apt.patient_name.toLowerCase().includes(term)) ||
      (apt.doctor_name && apt.doctor_name.toLowerCase().includes(term)) ||
      (apt.doctor_specialization && apt.doctor_specialization.toLowerCase().includes(term)) ||
      String(apt.id).includes(term) ||
      (apt.reason && apt.reason.toLowerCase().includes(term));

    const matchesStatus =
      selectedStatus === 'All' ||
      selectedStatus === 'All Statuses' ||
      apt.status === selectedStatus;

    const matchesDate = !selectedDate || apt.date === selectedDate;

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Appointment Scheduling
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Schedule patient consultations with real-time doctor conflict checking.
          </p>
        </div>

        <div>
          <button
            onClick={onOpenBookAppointment}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md shadow-sky-600/20 transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Filter Console matching screenshot */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by patient, doctor, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status select */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 text-slate-700 transition"
          >
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 text-slate-700 transition"
          />

          <button
            onClick={handleResetFilters}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition"
          >
            Reset Filters
          </button>

          <button
            onClick={onRefresh}
            className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition"
            title="Refresh appointments"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Appointment Table matching screenshot */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase text-slate-400 border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">APT ID</th>
                <th className="py-3.5 px-4">Patient Name</th>
                <th className="py-3.5 px-4">Doctor</th>
                <th className="py-3.5 px-4">Specialization</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => {
                  const initials = apt.patient_name
                    ? apt.patient_name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                    : 'P';

                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                        #{apt.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{apt.patient_name}</div>
                            {apt.patient_phone && (
                              <div className="text-[11px] text-slate-400">{apt.patient_phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{apt.doctor_name}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          {apt.doctor_specialization}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-800 font-medium">
                        {apt.date} {apt.time}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
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
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {apt.status === 'Scheduled' && (
                            <button
                              onClick={() => onUpdateStatus(apt.id, 'Completed')}
                              className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition"
                              title="Mark as Completed"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onEditAppointment(apt)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            title="Edit Appointment"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteAppointment(apt)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Appointment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No appointments found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
