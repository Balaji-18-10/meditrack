import React, { useState } from 'react';
import { 
  Plus, 
  Download, 
  Search, 
  RotateCw, 
  Edit3, 
  Trash2, 
  Activity, 
  User, 
  Phone,
  Filter
} from 'lucide-react';
import { Patient } from '../types';

interface PatientsProps {
  patients: Patient[];
  loading: boolean;
  onRefresh: () => void;
  onOpenAddPatient: () => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patient: Patient) => void;
  onViewHistory: (patientId: number) => void;
}

export const Patients: React.FC<PatientsProps> = ({
  patients,
  loading,
  onRefresh,
  onOpenAddPatient,
  onEditPatient,
  onDeletePatient,
  onViewHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState('All');

  // Filter patients by search term and gender
  const filteredPatients = patients.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      p.name.toLowerCase().includes(term) ||
      p.phone.toLowerCase().includes(term) ||
      String(p.id).includes(term) ||
      (p.email && p.email.toLowerCase().includes(term));

    const matchesGender =
      selectedGender === 'All' ||
      selectedGender === 'All Genders' ||
      p.gender.toLowerCase() === selectedGender.toLowerCase();

    return matchesSearch && matchesGender;
  });

  // CSV Export functionality
  const handleExportCSV = () => {
    if (filteredPatients.length === 0) return;

    const headers = [
      'Patient ID',
      'Full Name',
      'Age',
      'Gender',
      'Phone Contact',
      'Email',
      'Blood Group',
      'Emergency Contact',
      'Address',
      'Height (cm)',
      'Weight (kg)',
      'Medical History',
      'Registration Date',
    ];

    const rows = filteredPatients.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.age,
      p.gender,
      `"${p.phone}"`,
      `"${p.email || ''}"`,
      `"${p.blood_group || ''}"`,
      `"${p.emergency_contact || ''}"`,
      `"${(p.address || '').replace(/"/g, '""')}"`,
      p.height_cm || '',
      p.weight_kg || '',
      `"${(p.medical_history || '').replace(/"/g, '""')}"`,
      `"${p.created_at}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `meditrack_patients_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Patient Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Register, update, and review patient medical profiles and history.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddPatient}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md shadow-sky-600/20 transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Patient</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, phone, or patient ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 text-slate-700 transition"
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <button
            onClick={onRefresh}
            className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition"
            title="Refresh patient list"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Patient Table matching screenshot */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase text-slate-400 border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Patient ID</th>
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Age</th>
                <th className="py-3.5 px-4">Gender</th>
                <th className="py-3.5 px-4">Phone Contact</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((p) => {
                  const initials = p.name
                    ? p.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                    : 'P';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                        #{p.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{p.name}</div>
                            {p.email && <div className="text-[11px] text-slate-400">{p.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {p.age} yrs
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.gender === 'Female' ? 'bg-pink-500' : p.gender === 'Male' ? 'bg-sky-500' : 'bg-amber-500'
                            }`}
                          ></span>
                          {p.gender}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {p.phone}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onViewHistory(p.id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-sky-200 text-xs font-semibold flex items-center gap-1.5 transition"
                          >
                            <Activity className="w-3.5 h-3.5 text-sky-600" />
                            <span>History</span>
                          </button>
                          <button
                            onClick={() => onEditPatient(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            title="Edit Patient"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeletePatient(p)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Patient"
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
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No patients found matching the search criteria.
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
