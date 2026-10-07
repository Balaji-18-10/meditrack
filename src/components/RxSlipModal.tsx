import React, { useEffect, useState } from 'react';
import { X, Printer, Download, Plus, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { Prescription } from '../types';
import { api } from '../services/api';

interface RxSlipModalProps {
  prescriptionId: number | null;
  onClose: () => void;
}

export const RxSlipModal: React.FC<RxSlipModalProps> = ({
  prescriptionId,
  onClose,
}) => {
  const [rx, setRx] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!prescriptionId) return;
    setLoading(true);
    api.getPrescriptionById(prescriptionId)
      .then((data) => {
        setRx(data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [prescriptionId]);

  if (!prescriptionId) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Controls Bar (hidden during printing) */}
        <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <span className="font-semibold text-sm">Official Clinical Prescription (Rx Slip #{prescriptionId})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Rx Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="inline-block w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm">Generating medical prescription slip...</p>
          </div>
        ) : !rx ? (
          <div className="p-12 text-center text-slate-500">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm">Prescription not found.</p>
          </div>
        ) : (
          /* Printable Rx Document Area */
          <div id="printable-rx-slip" className="p-8 sm:p-10 bg-white text-slate-900">
            {/* Hospital Letterhead Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-slate-900 gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                  <Plus className="w-7 h-7 stroke-[3]" />
                </div>
                <div>
                  <div className="flex items-center text-2xl font-black tracking-tight text-slate-950">
                    <span>MEDI</span>
                    <span className="text-sky-600 ml-0.5">TRACK</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Healthcare Management System • Outpatient Department
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right text-xs text-slate-600 leading-relaxed">
                <p className="font-bold text-slate-800">MediTrack Central Medical Clinic</p>
                <p>104 Health Sciences Blvd, Metro Center</p>
                <p>Helpline: +1 (800) 555-MEDI • Lic: HC-88219</p>
              </div>
            </div>

            {/* Doctor & Patient Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-slate-200 text-xs">
              {/* Doctor Details */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-[10px] uppercase font-bold text-sky-700 tracking-wider">
                  Attending Physician
                </div>
                <div className="font-bold text-slate-900 text-sm">{rx.doctor_name}</div>
                <div className="text-slate-600">
                  {rx.doctor_title || 'Consultant Specialist'} • <span className="font-semibold text-slate-800">{rx.doctor_specialization}</span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Dept: {rx.doctor_department || rx.doctor_specialization} • Contact: {rx.doctor_phone}
                </div>
              </div>

              {/* Patient Details */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-[10px] uppercase font-bold text-sky-700 tracking-wider flex items-center justify-between">
                  <span>Patient Information</span>
                  <span className="text-slate-700 font-bold">PID #{rx.patient_id}</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{rx.patient_name}</div>
                <div className="text-slate-600">
                  Age: <span className="font-semibold text-slate-800">{rx.patient_age} yrs</span> • Gender: <span className="font-semibold text-slate-800">{rx.patient_gender}</span>
                  {rx.patient_blood_group && <span> • Blood Group: <span className="font-bold text-rose-600">{rx.patient_blood_group}</span></span>}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Phone: {rx.patient_phone} • Address: {rx.patient_address || 'Registered clinic patient'}
                </div>
              </div>
            </div>

            {/* Meta Row: Date & Diagnosis */}
            <div className="py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Date of Issue: </span>
                <span className="font-bold text-slate-900">{rx.issue_date}</span>
              </div>
              <div className="bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200/80">
                <span className="text-sky-900 font-semibold">Clinical Diagnosis: </span>
                <span className="font-bold text-sky-700">{rx.diagnosis}</span>
              </div>
            </div>

            {/* Rx Symbol & Medication Table */}
            <div className="pt-5 pb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl font-black font-serif italic text-sky-700">℞</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Prescribed Pharmaceuticals
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-600 border-b border-slate-200 text-[11px] font-semibold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Medicine Name</th>
                      <th className="py-2.5 px-3">Dosage / Strength</th>
                      <th className="py-2.5 px-3">Frequency</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rx.items && rx.items.length > 0 ? (
                      rx.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-semibold text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{item.medicine_name}</td>
                          <td className="py-2.5 px-3 text-slate-700">{item.dosage}</td>
                          <td className="py-2.5 px-3 text-slate-700">{item.frequency}</td>
                          <td className="py-2.5 px-3 text-slate-700">{item.duration}</td>
                          <td className="py-2.5 px-3 text-slate-600 italic">{item.instructions || 'As advised'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-slate-400">
                          {rx.summary || 'Standard prescription issued.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Clinical Instructions & Warnings */}
            {rx.instructions && (
              <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/60 mb-8 text-xs text-amber-900">
                <span className="font-bold block mb-1">Doctor's Directives & Advice:</span>
                <p className="leading-relaxed">{rx.instructions}</p>
              </div>
            )}

            {/* Bottom Signature & Verification Stamp */}
            <div className="pt-8 mt-6 border-t border-slate-200 flex flex-col sm:flex-row items-end justify-between gap-6">
              <div className="text-[10px] text-slate-400 max-w-sm">
                <p>This medical document was generated through the MediTrack Healthcare Management System.</p>
                <p className="mt-0.5">Verification Ref: MT-RX-{rx.id}-{rx.issue_date.replace(/-/g, '')}</p>
              </div>

              <div className="text-center sm:text-right">
                <div className="w-48 border-b-2 border-slate-800 pb-1 mb-1.5 font-script text-slate-700 italic text-base">
                  {rx.doctor_name}
                </div>
                <div className="text-xs font-bold text-slate-900">{rx.doctor_name}</div>
                <div className="text-[11px] text-slate-500">Authorized Medical Signature & Stamp</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
