import React, { useState } from 'react';
import { Check, RotateCcw, Activity, User, ShieldAlert, Heart, Droplets, Flame, Scale } from 'lucide-react';
import { Patient, BmiAssessment } from '../types';
import { api } from '../services/api';

interface BmiStudioProps {
  patients: Patient[];
  onBmiCalculated?: () => void;
}

export const BmiStudio: React.FC<BmiStudioProps> = ({ patients, onBmiCalculated }) => {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('70');
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState('Male');

  const [assessment, setAssessment] = useState<BmiAssessment>({
    bmi: 22.9,
    category: 'Healthy / Normal',
    idealWeightRange: '56.7 – 76.3 kg',
    bmr: 1649,
    waterIntakeL: 2.3,
    riskLevel: 'Optimal / Low',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // When patient is selected, auto-populate known stats
  const handleSelectPatient = (patientIdStr: string) => {
    setSelectedPatientId(patientIdStr);
    if (!patientIdStr) return;

    const patient = patients.find((p) => p.id === Number(patientIdStr));
    if (patient) {
      if (patient.height_cm) setHeight(String(patient.height_cm));
      if (patient.weight_kg) setWeight(String(patient.weight_kg));
      if (patient.age) setAge(String(patient.age));
      if (patient.gender) setGender(patient.gender);
    }
  };

  const handleCompute = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaveSuccess(false);

    const hNum = Number(height);
    const wNum = Number(weight);
    const aNum = Number(age);

    if (isNaN(hNum) || hNum < 50 || hNum > 280) {
      setError('Please enter a valid height between 50 and 280 cm.');
      return;
    }
    if (isNaN(wNum) || wNum < 10 || wNum > 400) {
      setError('Please enter a valid weight between 10 and 400 kg.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.calculateBmi({
        patient_id: selectedPatientId ? Number(selectedPatientId) : null,
        height_cm: hNum,
        weight_kg: wNum,
        age: aNum || 30,
        gender,
        save_record: true,
      });
      setAssessment(res);
      setSaveSuccess(true);
      if (onBmiCalculated) onBmiCalculated();
    } catch (err: any) {
      setError(err.message || 'Failed to calculate health metrics.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedPatientId('');
    setHeight('175');
    setWeight('70');
    setAge('30');
    setGender('Male');
    setError('');
    setSaveSuccess(false);
    setAssessment({
      bmi: 22.9,
      category: 'Healthy / Normal',
      idealWeightRange: '56.7 – 76.3 kg',
      bmr: 1649,
      waterIntakeL: 2.3,
      riskLevel: 'Optimal / Low',
    });
  };

  // Calculate pointer position percentage along scale (15 to 35 BMI range)
  const minScale = 15;
  const maxScale = 35;
  const clampedBmi = Math.min(Math.max(assessment.bmi, minScale), maxScale);
  const pointerPositionPercent = ((clampedBmi - minScale) / (maxScale - minScale)) * 100;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          BMI & Health Metrics Studio
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Calculate Body Mass Index, estimate ideal weight ranges, and link to patient records.
        </p>
      </div>

      {/* Main 2-Column Layout matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Card: Patient Health Parameters (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900 mb-5">
            Patient Health Parameters
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Assessment calculated and recorded to SQLite.</span>
            </div>
          )}

          <form onSubmit={handleCompute} className="space-y-4">
            {/* Select Patient Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assign to Registered Patient (Optional)
              </label>
              <div className="relative">
                <select
                  value={selectedPatientId}
                  onChange={(e) => handleSelectPatient(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition text-slate-800"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} - {p.name} ({p.gender}, {p.age}y)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Height & Weight Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Height (cm) <span className="text-sky-600">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition text-slate-800"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Standard adult height range: 100 - 240 cm
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Weight (kg) <span className="text-sky-600">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition text-slate-800"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Standard range: 30 - 250 kg
                </span>
              </div>
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Age (Years)
                </label>
                <input
                  type="number"
                  placeholder="30"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition text-slate-800"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-sky-600/20 transition flex items-center justify-center gap-2 disabled:bg-sky-400"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Check className="w-4 h-4 stroke-[3]" />
                )}
                <span>Compute Health Assessment</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Right Card: Computed Results matching screenshot (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="text-center space-y-3 mb-6">
            <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
              Body Mass Index
            </span>
            <div className="text-5xl sm:text-6xl font-black text-sky-600 tracking-tight">
              {assessment.bmi.toFixed(1)}
            </div>
            <div>
              <span
                className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold ${
                  assessment.category === 'Healthy / Normal'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : assessment.category === 'Underweight'
                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                    : assessment.category === 'Overweight'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {assessment.category}
              </span>
            </div>
          </div>

          {/* Continuous Scale Bar with Triangle Pointer */}
          <div className="my-6 px-2">
            <div className="relative pt-4 pb-2">
              {/* Pointer Triangle */}
              <div
                className="absolute top-0 -translate-x-1/2 transition-all duration-300 flex flex-col items-center"
                style={{ left: `${pointerPositionPercent}%` }}
              >
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-800"></div>
              </div>

              {/* Gradient Bar */}
              <div className="h-3 w-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 via-amber-400 to-rose-500 shadow-inner"></div>
            </div>

            {/* Scale Labels */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
              <span>&lt; 18.5 Underweight</span>
              <span>18.5 – 24.9 Normal</span>
              <span>25 – 29.9 Overweight</span>
              <span>30+ Obese</span>
            </div>
          </div>

          {/* 4 Metric Cards in 2x2 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {/* Ideal Weight Range */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-medium text-slate-500 block">
                Ideal Weight Range
              </span>
              <span className="text-lg font-bold text-slate-900 block">
                {assessment.idealWeightRange}
              </span>
            </div>

            {/* Est. Basal Metabolic Rate */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-medium text-slate-500 block">
                Est. Basal Metabolic Rate
              </span>
              <span className="text-lg font-bold text-slate-900 block">
                {assessment.bmr.toLocaleString()} kcal/day
              </span>
            </div>

            {/* Recommended Water */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-medium text-slate-500 block">
                Recommended Water
              </span>
              <span className="text-lg font-bold text-slate-900 block">
                {assessment.waterIntakeL} L / day
              </span>
            </div>

            {/* Health Risk Level */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-medium text-slate-500 block">
                Health Risk Level
              </span>
              <span
                className={`text-lg font-bold block ${
                  assessment.riskLevel.includes('Optimal') || assessment.riskLevel.includes('Low')
                    ? 'text-emerald-600'
                    : assessment.riskLevel.includes('Moderate')
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {assessment.riskLevel}
              </span>
            </div>
          </div>

          {/* Medical Disclaimer Note matching screenshot */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              * Notice: BMI is a clinical screening measure and not an individual diagnostic tool.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
