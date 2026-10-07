import React, { useEffect, useState } from 'react';
import { X, Calendar, FileText, Activity, Phone, Mail, MapPin, Heart, AlertCircle } from 'lucide-react';
import { Patient, Appointment, Prescription } from '../types';
import { api } from '../services/api';

interface PatientHistoryModalProps {
  patientId: number | null;
  onClose: () => void;
  onSelectPrescription?: (rxId: number) => void;
}

export const PatientHistoryModal: React.FC<PatientHistoryModalProps> = ({
  patientId,
  onClose,
  onSelectPrescription,
}) => {
  const [data, setData] = useState<{
    patient: Patient;
    appointments: Appointment[];
    prescriptions: Prescription[];
    bmiRecord?: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'prescriptions' | 'metrics'>('appointments');

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    api.getPatientById(patientId)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [patientId]);

  if (!patientId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-100 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-sm shadow-2xs">
              {data?.patient ? data.patient.name.charAt(0).toUpperCase() : '#'}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {data?.patient ? `${data.patient.name} – Clinical Record` : 'Loading Record...'}
              </h3>
              <p className="text-xs text-slate-500">
                Patient ID: #{patientId} • Permanent Electronic Health Record
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="inline-block w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm">Fetching complete patient timeline from SQLite...</p>
          </div>
        ) : !data ? (
          <div className="p-8 text-center text-slate-500">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p>Patient record not found.</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Quick Profile Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Age & Gender</span>
                <span className="font-semibold text-slate-800">{data.patient.age} yrs • {data.patient.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Blood Group</span>
                <span className="font-semibold text-rose-600">{data.patient.blood_group || 'Not recorded'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Phone</span>
                <span className="font-semibold text-slate-800">{data.patient.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Emergency</span>
                <span className="font-semibold text-slate-800">{data.patient.emergency_contact || 'None'}</span>
              </div>
              {data.patient.medical_history && (
                <div className="col-span-2 sm:col-span-4 mt-2 pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 font-medium">Medical History: </span>
                  <span className="text-slate-700">{data.patient.medical_history}</span>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('appointments')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
                  activeTab === 'appointments'
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Appointment History ({data.appointments.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('prescriptions')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
                  activeTab === 'prescriptions'
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Prescriptions ({data.prescriptions.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('metrics')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
                  activeTab === 'metrics'
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Health Metrics & BMI</span>
              </button>
            </div>

            {/* Tab 1: Appointments */}
            {activeTab === 'appointments' && (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {data.appointments.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No previous appointments recorded.</p>
                ) : (
                  data.appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs hover:border-slate-300 transition"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">
                          {apt.doctor_name} • <span className="text-sky-600 font-normal">{apt.doctor_specialization}</span>
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          Date: <span className="font-medium text-slate-700">{apt.date} {apt.time}</span>
                          {apt.reason && <span> — "{apt.reason}"</span>}
                        </div>
                      </div>
                      <div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            apt.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : apt.status === 'Cancelled'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-sky-50 text-sky-700 border border-sky-200'
                          }`}
                        >
                          ● {apt.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Prescriptions */}
            {activeTab === 'prescriptions' && (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {data.prescriptions.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No prescriptions issued yet.</p>
                ) : (
                  data.prescriptions.map((rx) => (
                    <div
                      key={rx.id}
                      className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs hover:border-slate-300 transition"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          <span>Rx #{rx.id}: {rx.diagnosis}</span>
                          <span className="text-[10px] text-slate-400 font-normal">Issued: {rx.issue_date}</span>
                        </div>
                        <div className="text-slate-600 mt-1">
                          Doctor: <span className="font-medium text-slate-700">{rx.doctor_name}</span> ({rx.doctor_specialization})
                        </div>
                        {rx.summary && (
                          <div className="text-slate-500 mt-0.5">
                            Summary: <span className="font-medium text-sky-700">{rx.summary}</span>
                          </div>
                        )}
                      </div>
                      {onSelectPrescription && (
                        <button
                          onClick={() => {
                            onClose();
                            onSelectPrescription(rx.id);
                          }}
                          className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg font-semibold text-xs transition"
                        >
                          View Rx Slip
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Health Metrics */}
            {activeTab === 'metrics' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                {data.bmiRecord ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-2xs">
                      <span className="text-slate-400 text-xs block">BMI Score</span>
                      <span className="text-xl font-bold text-sky-600">{data.bmiRecord.bmi}</span>
                      <span className="text-[10px] text-emerald-600 block mt-0.5">{data.bmiRecord.category}</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-2xs">
                      <span className="text-slate-400 text-xs block">Height & Weight</span>
                      <span className="text-sm font-bold text-slate-800">{data.bmiRecord.height_cm} cm</span>
                      <span className="text-xs text-slate-600 block">{data.bmiRecord.weight_kg} kg</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-2xs">
                      <span className="text-slate-400 text-xs block">Est. BMR</span>
                      <span className="text-base font-bold text-slate-800">{data.bmiRecord.bmr}</span>
                      <span className="text-[10px] text-slate-400 block">kcal/day</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-2xs">
                      <span className="text-slate-400 text-xs block">Hydration</span>
                      <span className="text-base font-bold text-slate-800">{data.bmiRecord.water_intake_l} L</span>
                      <span className="text-[10px] text-slate-400 block">daily water</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No BMI assessment recorded yet. Visit the BMI & Health Studio to compute baseline metrics.
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Close Record
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
