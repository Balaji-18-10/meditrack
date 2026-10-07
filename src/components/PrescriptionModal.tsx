import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Pill, User, UserCheck, Calendar, FileText } from 'lucide-react';
import { Doctor, Patient } from '../types';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  patients: Patient[];
  doctors: Doctor[];
  defaultPatientId?: number;
}

interface MedicineInput {
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  patients,
  doctors,
  defaultPatientId,
}) => {
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [instructions, setInstructions] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [medicines, setMedicines] = useState<MedicineInput[]>([
    { medicine_name: 'Dolo 650', dosage: '650 mg', frequency: 'Twice daily after meals', duration: '3 days', instructions: 'Take with warm water' },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setIssueDate(today);
    setPatientId(defaultPatientId ? String(defaultPatientId) : patients.length > 0 ? String(patients[0].id) : '');
    setDoctorId(doctors.length > 0 ? String(doctors[0].id) : '');
    setDiagnosis('');
    setInstructions('');
    setMedicines([
      { medicine_name: '', dosage: '500 mg', frequency: 'Twice daily', duration: '5 days', instructions: 'Take after meals' },
    ]);
    setErrors({});
  }, [isOpen, defaultPatientId, patients, doctors]);

  if (!isOpen) return null;

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      { medicine_name: '', dosage: '', frequency: 'Once daily', duration: '5 days', instructions: '' },
    ]);
  };

  const handleRemoveMedicine = (idx: number) => {
    if (medicines.length <= 1) return;
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const handleMedicineChange = (idx: number, field: keyof MedicineInput, val: string) => {
    const updated = [...medicines];
    updated[idx][field] = val;
    setMedicines(updated);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!patientId) errs.patient_id = 'Please select a patient.';
    if (!doctorId) errs.doctor_id = 'Please select a prescribing doctor.';
    if (!diagnosis.trim()) errs.diagnosis = 'Clinical diagnosis is required.';
    
    const validMeds = medicines.filter(m => m.medicine_name.trim().length > 0);
    if (validMeds.length === 0) {
      errs.medicines = 'At least one medicine name must be entered.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const validMeds = medicines.filter(m => m.medicine_name.trim().length > 0);
      const summary = validMeds.map(m => m.medicine_name.trim()).join(', ');

      await onSubmit({
        patient_id: Number(patientId),
        doctor_id: Number(doctorId),
        diagnosis: diagnosis.trim(),
        summary,
        instructions: instructions.trim(),
        issue_date: issueDate,
        medicines: validMeds,
      });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to write prescription.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-100 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Write Medical Prescription
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Issue verified pharmaceuticals, clinical dosages, and patient instructions.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errors.form && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {errors.form}
            </div>
          )}

          {/* Patient and Doctor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Patient <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className={`w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border ${
                    errors.patient_id ? 'border-red-400' : 'border-slate-200'
                  } outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition`}
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} - {p.name} ({p.age}y, {p.gender})
                    </option>
                  ))}
                </select>
              </div>
              {errors.patient_id && <p className="text-[11px] text-red-500 mt-1">{errors.patient_id}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Prescribing Doctor <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <select
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  className={`w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border ${
                    errors.doctor_id ? 'border-red-400' : 'border-slate-200'
                  } outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition`}
                >
                  <option value="">-- Select Doctor --</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>
              {errors.doctor_id && <p className="text-[11px] text-red-500 mt-1">{errors.doctor_id}</p>}
            </div>
          </div>

          {/* Diagnosis & Issue Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Clinical Diagnosis <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Mild febrile episode / Acute Tension Headache"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className={`w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border ${
                    errors.diagnosis ? 'border-red-400' : 'border-slate-200'
                  } outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition`}
                />
              </div>
              {errors.diagnosis && <p className="text-[11px] text-red-500 mt-1">{errors.diagnosis}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Issue Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Prescribed Medicines Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Prescribed Pharmaceuticals
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medicine</span>
              </button>
            </div>

            {errors.medicines && <p className="text-xs text-red-500">{errors.medicines}</p>}

            <div className="space-y-3">
              {medicines.map((med, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-500">Item #{idx + 1}</span>
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove medicine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">
                        Medicine Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Paracetamol / Amoxicillin"
                        value={med.medicine_name}
                        onChange={(e) => handleMedicineChange(idx, 'medicine_name', e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 outline-none focus:border-sky-500 transition"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">
                        Dosage / Strength
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 500 mg / 10 ml"
                        value={med.dosage}
                        onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 outline-none focus:border-sky-500 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">
                        Frequency
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Twice daily"
                        value={med.frequency}
                        onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 outline-none focus:border-sky-500 transition"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 5 days"
                        value={med.duration}
                        onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 outline-none focus:border-sky-500 transition"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">
                        Specific Instructions
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. After meals"
                        value={med.instructions}
                        onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 outline-none focus:border-sky-500 transition"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              General Patient Advice & Clinical Directives
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Maintain hydration, avoid driving after dose, report any allergic rashes immediately..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md shadow-sky-600/20 disabled:bg-sky-300 transition flex items-center gap-2"
            >
              {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              <span>Save & Issue Prescription</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
