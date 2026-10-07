import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  RotateCw, 
  Printer, 
  Edit3, 
  Trash2, 
  FileText, 
  User, 
  Calendar,
  Pill
} from 'lucide-react';
import { Prescription } from '../types';

interface PrescriptionsProps {
  prescriptions: Prescription[];
  loading: boolean;
  onRefresh: () => void;
  onOpenWritePrescription: () => void;
  onViewRxSlip: (id: number) => void;
  onDeletePrescription: (prescription: Prescription) => void;
}

export const Prescriptions: React.FC<PrescriptionsProps> = ({
  prescriptions,
  loading,
  onRefresh,
  onOpenWritePrescription,
  onViewRxSlip,
  onDeletePrescription,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      (rx.patient_name && rx.patient_name.toLowerCase().includes(term)) ||
      (rx.doctor_name && rx.doctor_name.toLowerCase().includes(term)) ||
      (rx.diagnosis && rx.diagnosis.toLowerCase().includes(term)) ||
      (rx.summary && rx.summary.toLowerCase().includes(term)) ||
      String(rx.id).includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Prescription Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Issue medical prescriptions, manage dosages, and generate digital print-ready Rx slips.
          </p>
        </div>

        <div>
          <button
            onClick={onOpenWritePrescription}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md shadow-sky-600/20 transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Write Prescription</span>
          </button>
        </div>
      </div>

      {/* Search & Refresh Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search medicines, patient, or doctor..."
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

      {/* Prescription Table matching screenshot */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase text-slate-400 border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">RX ID</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Prescribing Doctor</th>
                <th className="py-3.5 px-4">Prescription Summary</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrescriptions.length > 0 ? (
                filteredPrescriptions.map((rx) => {
                  const initial = rx.patient_name ? rx.patient_name.charAt(0).toUpperCase() : 'P';

                  return (
                    <tr key={rx.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                        #{rx.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                            {initial}
                          </div>
                          <span className="font-semibold text-slate-900 text-sm">{rx.patient_name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-semibold text-slate-900">{rx.doctor_name}</div>
                          <div className="text-[11px] text-slate-400">{rx.doctor_specialization}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{rx.summary || rx.diagnosis}</div>
                        {rx.item_count ? (
                          <div className="text-[10px] text-slate-400 mt-0.5">{rx.item_count} medications listed</div>
                        ) : null}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {rx.issue_date}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onViewRxSlip(rx.id)}
                            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-sky-600/20 transition"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Rx Slip</span>
                          </button>
                          <button
                            onClick={() => onDeletePrescription(rx)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Prescription"
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
                    No prescription records found matching your search.
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
