import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  RotateCw, 
  Calendar, 
  Edit3, 
  Trash2, 
  UserCheck, 
  Award, 
  Building 
} from 'lucide-react';
import { Doctor } from '../types';

interface DoctorsProps {
  doctors: Doctor[];
  loading: boolean;
  onRefresh: () => void;
  onOpenAddDoctor: () => void;
  onEditDoctor: (doctor: Doctor) => void;
  onDeleteDoctor: (doctor: Doctor) => void;
  onScheduleWithDoctor: (doctorId: number) => void;
}

export const Doctors: React.FC<DoctorsProps> = ({
  doctors,
  loading,
  onRefresh,
  onOpenAddDoctor,
  onEditDoctor,
  onDeleteDoctor,
  onScheduleWithDoctor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDoctors = doctors.filter((d) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      d.name.toLowerCase().includes(term) ||
      d.specialization.toLowerCase().includes(term) ||
      d.department.toLowerCase().includes(term) ||
      String(d.id).includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Doctor Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage medical specialists, clinic departments, and consultation quotas.
          </p>
        </div>

        <div>
          <button
            onClick={onOpenAddDoctor}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md shadow-sky-600/20 transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Doctor</span>
          </button>
        </div>
      </div>

      {/* Search & Refresh Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search doctor by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition"
          />
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Doctor Table matching screenshot */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase text-slate-400 border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Doctor ID</th>
                <th className="py-3.5 px-4">Doctor Name</th>
                <th className="py-3.5 px-4">Specialization</th>
                <th className="py-3.5 px-4">Booked Appointments</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doc) => {
                  const initials = doc.name
                    ? doc.name.replace(/^Dr\.\s*/i, '').split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                    : 'DR';

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                        #{doc.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{doc.name}</div>
                            <div className="text-[11px] text-slate-400">{doc.title || 'Licensed Practitioner'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          {doc.specialization}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        <span className="font-semibold text-slate-900">{doc.booked_appointments ?? 0}</span> scheduled
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onScheduleWithDoctor(doc.id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-sky-200 text-xs font-semibold flex items-center gap-1.5 transition"
                          >
                            <Calendar className="w-3.5 h-3.5 text-sky-600" />
                            <span>Schedule</span>
                          </button>
                          <button
                            onClick={() => onEditDoctor(doc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            title="Edit Doctor"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteDoctor(doc)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Doctor"
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
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No medical specialists found matching the search.
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
