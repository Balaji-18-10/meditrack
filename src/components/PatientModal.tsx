import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Heart, ShieldAlert, Activity } from 'lucide-react';
import { Patient } from '../types';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Patient>) => Promise<void>;
  initialData?: Patient | null;
}

export const PatientModal: React.FC<PatientModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    phone: '',
    email: '',
    address: '',
    emergency_contact: '',
    blood_group: 'O+',
    medical_history: '',
    height_cm: '',
    weight_kg: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        age: initialData.age !== undefined ? String(initialData.age) : '',
        gender: initialData.gender || 'Male',
        phone: initialData.phone || '',
        email: initialData.email || '',
        address: initialData.address || '',
        emergency_contact: initialData.emergency_contact || '',
        blood_group: initialData.blood_group || 'O+',
        medical_history: initialData.medical_history || '',
        height_cm: initialData.height_cm ? String(initialData.height_cm) : '',
        weight_kg: initialData.weight_kg ? String(initialData.weight_kg) : '',
      });
    } else {
      setFormData({
        name: '',
        age: '',
        gender: 'Male',
        phone: '',
        email: '',
        address: '',
        emergency_contact: '',
        blood_group: 'O+',
        medical_history: '',
        height_cm: '',
        weight_kg: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Patient full name is required.';
    if (!formData.age.trim()) {
      errs.age = 'Age is required.';
    } else {
      const ageNum = Number(formData.age);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
        errs.age = 'Enter a valid age between 0 and 150.';
      }
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Phone contact is required.';
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (formData.height_cm && (isNaN(Number(formData.height_cm)) || Number(formData.height_cm) < 30 || Number(formData.height_cm) > 300)) {
      errs.height_cm = 'Height must be between 30 and 300 cm.';
    }
    if (formData.weight_kg && (isNaN(Number(formData.weight_kg)) || Number(formData.weight_kg) < 2 || Number(formData.weight_kg) > 500)) {
      errs.weight_kg = 'Weight must be between 2 and 500 kg.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        address: formData.address.trim() || null,
        emergency_contact: formData.emergency_contact.trim() || null,
        blood_group: formData.blood_group || null,
        medical_history: formData.medical_history.trim() || null,
        height_cm: formData.height_cm ? Number(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? Number(formData.weight_kg) : null,
      });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save patient record.' });
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
              {initialData ? 'Edit Patient Profile' : 'Register New Patient'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter clinical profile and baseline records into SQLite store.
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
          {errors.form && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Full Name & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Sofia Chen"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border ${
                    errors.name ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-sky-200'
                  } outline-none focus:bg-white focus:ring-2 focus:border-sky-500 transition`}
                />
              </div>
              {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Age (Years) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="150"
                placeholder="e.g. 27"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border ${
                  errors.age ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-sky-200'
                } outline-none focus:bg-white focus:ring-2 focus:border-sky-500 transition`}
              />
              {errors.age && <p className="text-[11px] text-red-500 mt-1">{errors.age}</p>}
            </div>
          </div>

          {/* Gender & Blood Group & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Blood Group
              </label>
              <select
                value={formData.blood_group}
                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Contact <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border ${
                    errors.phone ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-sky-200'
                  } outline-none focus:bg-white focus:ring-2 focus:border-sky-500 transition`}
                />
              </div>
              {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Email & Emergency Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border ${
                    errors.email ? 'border-red-400' : 'border-slate-200'
                  } outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Emergency Contact
              </label>
              <input
                type="text"
                placeholder="Name & Contact (e.g. Parent / Spouse)"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition"
              />
            </div>
          </div>

          {/* Height & Weight (for BMI auto integration) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Height (cm)</span>
                <span className="text-[10px] text-slate-400 font-normal">Optional baseline</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 175"
                value={formData.height_cm}
                onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition"
              />
              {errors.height_cm && <p className="text-[11px] text-red-500 mt-1">{errors.height_cm}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Weight (kg)</span>
                <span className="text-[10px] text-slate-400 font-normal">Optional baseline</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 70"
                value={formData.weight_kg}
                onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition"
              />
              {errors.weight_kg && <p className="text-[11px] text-red-500 mt-1">{errors.weight_kg}</p>}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Residential Address
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Street address, city, state"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition"
              />
            </div>
          </div>

          {/* Medical History */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Medical History & Allergies
            </label>
            <textarea
              rows={2}
              placeholder="Known conditions, chronic medications, surgical history, or drug allergies..."
              value={formData.medical_history}
              onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
              className="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition resize-none"
            />
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
              <span>{initialData ? 'Save Changes' : 'Register Patient'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
