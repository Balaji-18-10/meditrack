import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  User, 
  UserCheck, 
  FileText, 
  UserPlus, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Phone,
  Mail
} from 'lucide-react';
import { Appointment, Doctor, Patient, AppointmentStatus } from '../types';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Appointment>) => Promise<void>;
  patients: Patient[];
  doctors: Doctor[];
  initialData?: Appointment | null;
  defaultDoctorId?: number;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  patients,
  doctors,
  initialData,
  defaultDoctorId,
}) => {
  const [patientName, setPatientName] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [forceNewPatient, setForceNewPatient] = useState(false);

  // Quick Add Additional Details (optional)
  const [showExtraDetails, setShowExtraDetails] = useState(false);
  const [extraDetails, setExtraDetails] = useState({
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
  });

  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [reason, setReason] = useState('General Consultation');
  const [status, setStatus] = useState<AppointmentStatus>('Scheduled');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflictError, setConflictError] = useState<{
    message: string;
    details?: any;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setPatientName(initialData.patient_name || '');
      setSelectedPatientId(initialData.patient_id || null);
      setDoctorId(String(initialData.doctor_id));
      setDate(initialData.date);
      setTime(initialData.time ? initialData.time.substring(0, 5) : '10:00');
      setReason(initialData.reason || 'General Consultation');
      setStatus(initialData.status || 'Scheduled');
      setForceNewPatient(false);
      setShowExtraDetails(false);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setPatientName('');
      setSelectedPatientId(null);
      setDoctorId(defaultDoctorId ? String(defaultDoctorId) : doctors.length > 0 ? String(doctors[0].id) : '');
      setDate(today);
      setTime('10:00');
      setReason('General Consultation');
      setStatus('Scheduled');
      setForceNewPatient(false);
      setShowExtraDetails(false);
      setExtraDetails({ age: '', gender: 'Male', phone: '', email: '' });
    }
    setErrors({});
    setConflictError(null);
  }, [initialData, defaultDoctorId, isOpen, doctors]);

  // Real-time search for existing patients matching the typed text
  const matchingPatients = useMemo(() => {
    const query = patientName.trim().toLowerCase();
    if (!query || query.length < 2) return [];
    return patients.filter((p) => p.name.toLowerCase().includes(query)).slice(0, 3);
  }, [patientName, patients]);

  // Exact matching patient (case-insensitive, trimmed)
  const exactMatch = useMemo(() => {
    const query = patientName.trim().toLowerCase();
    if (!query) return null;
    return patients.find((p) => p.name.trim().toLowerCase() === query) || null;
  }, [patientName, patients]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    const trimmedName = patientName.trim();

    if (!trimmedName) {
      errs.patient_name = 'Please enter a patient name.';
    } else if (!/[a-zA-Z]/.test(trimmedName)) {
      errs.patient_name = 'Please enter a valid patient name containing letters.';
    }

    if (!doctorId) errs.doctor_id = 'Please select an assigned doctor.';
    if (!date) errs.date = 'Appointment date is required.';
    if (!time) errs.time = 'Appointment time is required.';

    if (showExtraDetails) {
      if (extraDetails.age && (isNaN(Number(extraDetails.age)) || Number(extraDetails.age) < 0 || Number(extraDetails.age) > 150)) {
        errs.age = 'Valid age (0 - 150) required.';
      }
      if (extraDetails.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(extraDetails.email.trim())) {
        errs.email = 'Valid email format required.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        patient_name: patientName.trim(),
        patient_id: selectedPatientId || undefined,
        force_new_patient: forceNewPatient,
        new_patient_details: showExtraDetails ? {
          age: extraDetails.age ? Number(extraDetails.age) : undefined,
          gender: extraDetails.gender,
          phone: extraDetails.phone.trim() || undefined,
          email: extraDetails.email.trim() || undefined,
        } : undefined,
        doctor_id: Number(doctorId),
        date,
        time,
        reason,
        status,
      });
      onClose();
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('conflict')) {
        setConflictError({
          message: err.message,
        });
      } else {
        setErrors({ form: err.message || 'Unable to schedule appointment. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseExistingPatient = (patient: Patient) => {
    setPatientName(patient.name);
    setSelectedPatientId(patient.id);
    setForceNewPatient(false);
    if (patient.age) setExtraDetails(prev => ({ ...prev, age: String(patient.age) }));
    if (patient.gender) setExtraDetails(prev => ({ ...prev, gender: patient.gender }));
    if (patient.phone) setExtraDetails(prev => ({ ...prev, phone: patient.phone }));
  };

  const handleForceCreateNew = () => {
    setForceNewPatient(true);
    setSelectedPatientId(null);
  };

  const standardTimes = [
    '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '13:00', '13:30', '14:00', '14:15', '14:30', '15:00',
    '15:30', '16:00', '16:30', '17:00'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-100 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {initialData ? 'Edit Appointment' : 'Book New Consultation'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Scheduling engine with automated doctor conflict detection.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Conflict Detected Alert Banner */}
          {conflictError && (
            <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-800 flex items-start gap-3 animate-shake">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Scheduling Conflict Detected
                </div>
                <p className="text-xs font-medium mt-1 leading-relaxed">
                  {conflictError.message}
                </p>
                <p className="text-[11px] text-rose-600 mt-1">
                  Please pick an alternate time slot or choose another available doctor.
                </p>
              </div>
            </div>
          )}

          {errors.form && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {errors.form}
            </div>
          )}

          {/* Patient Name Free-Text Entry */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Patient Name <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowExtraDetails(!showExtraDetails)}
                className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{showExtraDetails ? 'Hide Extra Details' : '+ Add New Patient Details'}</span>
              </button>
            </div>

            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={patientName}
                onChange={(e) => {
                  setPatientName(e.target.value);
                  setSelectedPatientId(null);
                  setForceNewPatient(false);
                }}
                placeholder="Enter patient name..."
                className={`w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border ${
                  errors.patient_name ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-sky-200'
                } outline-none focus:bg-white focus:ring-2 focus:border-sky-500 transition text-slate-900`}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Enter an existing patient name or create a new patient.
            </p>
            {errors.patient_name && (
              <p className="text-[11px] text-red-500 mt-1">{errors.patient_name}</p>
            )}

            {/* Smart Patient Suggestions / Existing Match Display */}
            {patientName.trim().length >= 2 && matchingPatients.length > 0 && !selectedPatientId && (
              <div className="mt-2.5 p-3 rounded-xl bg-sky-50/70 border border-sky-200/80 space-y-2 text-xs animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-sky-900 font-semibold text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    Existing patient found:
                  </span>
                  <span className="text-slate-400 font-normal">
                    {matchingPatients.length} match{matchingPatients.length > 1 ? 'es' : ''}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {matchingPatients.map((p) => {
                    const isExact = p.name.trim().toLowerCase() === patientName.trim().toLowerCase();
                    return (
                      <div
                        key={p.id}
                        className="p-2 bg-white rounded-lg border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{p.name}</span>
                          <span className="text-slate-500 ml-1.5 text-[11px]">
                            Patient ID: <span className="font-semibold text-slate-700">#{p.id}</span>
                            {p.age ? ` • ${p.age}y, ${p.gender}` : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUseExistingPatient(p)}
                            className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md text-[11px] transition shadow-2xs"
                          >
                            Use existing patient
                          </button>
                          {isExact && !forceNewPatient && (
                            <button
                              type="button"
                              onClick={handleForceCreateNew}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-md text-[11px] transition"
                            >
                              Create as new patient
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selected Existing Patient Confirmation */}
            {selectedPatientId && (
              <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Linked to existing record: <span className="font-bold">{patientName}</span> (ID #{selectedPatientId})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPatientId(null)}
                  className="text-[11px] text-emerald-700 underline font-medium hover:text-emerald-900"
                >
                  Clear link
                </button>
              </div>
            )}

            {/* Forced New Patient Notice */}
            {forceNewPatient && (
              <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center justify-between">
                <span>
                  Will be registered as a distinct new patient: <span className="font-bold">{patientName}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setForceNewPatient(false)}
                  className="text-[11px] text-amber-700 underline font-medium hover:text-amber-900"
                >
                  Auto-match
                </button>
              </div>
            )}
          </div>

          {/* Optional Quick Add Patient Details Accordion */}
          {showExtraDetails && (
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-3 animate-in fade-in duration-150">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Optional Patient Profile Information
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    placeholder="e.g. 28"
                    value={extraDetails.age}
                    onChange={(e) => setExtraDetails({ ...extraDetails, age: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-sky-500"
                  />
                  {errors.age && <p className="text-[10px] text-red-500 mt-0.5">{errors.age}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Gender
                  </label>
                  <select
                    value={extraDetails.gender}
                    onChange={(e) => setExtraDetails({ ...extraDetails, gender: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-sky-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Phone Contact
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      value={extraDetails.phone}
                      onChange={(e) => setExtraDetails({ ...extraDetails, phone: e.target.value })}
                      className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="patient@example.com"
                      value={extraDetails.email}
                      onChange={(e) => setExtraDetails({ ...extraDetails, email: e.target.value })}
                      className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-sky-500"
                    />
                  </div>
                  {errors.email && <p className="text-[10px] text-red-500 mt-0.5">{errors.email}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Doctor Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Assigned Doctor <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <select
                value={doctorId}
                onChange={(e) => {
                  setDoctorId(e.target.value);
                  setConflictError(null);
                }}
                className={`w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border ${
                  errors.doctor_id ? 'border-red-400' : 'border-slate-200'
                } outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition text-slate-900`}
              >
                <option value="">-- Choose Doctor --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} • {d.specialization} ({d.department})
                  </option>
                ))}
              </select>
            </div>
            {errors.doctor_id && <p className="text-[11px] text-red-500 mt-1">{errors.doctor_id}</p>}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setConflictError(null);
                  }}
                  className={`w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border ${
                    errors.date ? 'border-red-400' : 'border-slate-200'
                  } outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition text-slate-900`}
                />
              </div>
              {errors.date && <p className="text-[11px] text-red-500 mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Time Slot <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  list="time-slots"
                  type="text"
                  placeholder="e.g. 10:00"
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    setConflictError(null);
                  }}
                  className={`w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border ${
                    errors.time ? 'border-red-400' : 'border-slate-200'
                  } outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition text-slate-900`}
                />
                <datalist id="time-slots">
                  {standardTimes.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>
              {errors.time && <p className="text-[11px] text-red-500 mt-1">{errors.time}</p>}
            </div>
          </div>

          {/* Reason for Visit */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reason for Visit / Clinical Notes
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Routine cardiac rhythm checkup"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition text-slate-900"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Consultation Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition text-slate-900"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Actions */}
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
              <span>{initialData ? 'Update Appointment' : 'Confirm & Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
