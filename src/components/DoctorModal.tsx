import React, { useState, useEffect } from 'react';
import { X, UserCheck, Phone, Mail, Award, Clock, Building } from 'lucide-react';
import { Doctor } from '../types';

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Doctor>) => Promise<void>;
  initialData?: Doctor | null;
}

export const DoctorModal: React.FC<DoctorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    title: 'Licensed Practitioner',
    specialization: 'Cardiology',
    phone: '',
    email: '',
    department: 'Cardiology',
    availability: 'Mon - Fri, 09:00 - 17:00',
    experience_years: '8',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const specializations = [
    'Cardiology',
    'Cardiologist',
    'Pediatrics',
    'Neurology',
    'General Medicine',
    'Dermatology',
    'Orthopedics',
    'Internal Medicine',
    'Psychiatry',
    'Ophthalmology',
    'ENT',
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        title: initialData.title || 'Licensed Practitioner',
        specialization: initialData.specialization || 'Cardiology',
        phone: initialData.phone || '',
        email: initialData.email || '',
        department: initialData.department || initialData.specialization || 'Cardiology',
        availability: initialData.availability || 'Mon - Fri, 09:00 - 17:00',
        experience_years: initialData.experience_years !== undefined ? String(initialData.experience_years) : '8',
      });
    } else {
      setFormData({
        name: '',
        title: 'Licensed Practitioner',
        specialization: 'Cardiology',
        phone: '',
        email: '',
        department: 'Cardiology',
        availability: 'Mon - Fri, 09:00 - 17:00',
        experience_years: '8',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Doctor name is required.';
    if (!formData.specialization.trim()) errs.specialization = 'Specialization is required.';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required.';
    if (!formData.email.trim()) {
      errs.email = 'Official email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Invalid email address format.';
    }
    if (formData.experience_years && isNaN(Number(formData.experience_years))) {
      errs.experience_years = 'Experience must be a number.';
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
        title: formData.title.trim() || 'Licensed Practitioner',
        specialization: formData.specialization.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        department: formData.department.trim() || formData.specialization.trim(),
        availability: formData.availability.trim(),
        experience_years: Number(formData.experience_years) || 5,
      });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save doctor.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-100 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {initialData ? 'Edit Doctor Profile' : 'Add Medical Specialist'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Maintain clinic staff credentials, departments, and consultation quotas.
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
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {errors.form}
            </div>
          )}

          {/* Name & Academic Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Doctor Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Dr. Rajesh Sharma, MBBS"
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
                Staff Status
              </label>
              <input
                type="text"
                placeholder="Licensed Practitioner"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition"
              />
            </div>
          </div>

          {/* Specialization & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Specialization <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  list="specialization-options"
                  type="text"
                  placeholder="e.g. Cardiology"
                  value={formData.specialization}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ 
                      ...formData, 
                      specialization: val,
                      department: formData.department === formData.specialization ? val : formData.department 
                    });
                  }}
                  className={`w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border ${
                    errors.specialization ? 'border-red-400' : 'border-slate-200'
                  } outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition`}
                />
                <datalist id="specialization-options">
                  {specializations.map((spec) => (
                    <option key={spec} value={spec} />
                  ))}
                </datalist>
              </div>
              {errors.specialization && <p className="text-[11px] text-red-500 mt-1">{errors.specialization}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Department
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Cardiology Unit"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Contact: Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    errors.phone ? 'border-red-400' : 'border-slate-200'
                  } outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition`}
                />
              </div>
              {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Staff Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  placeholder="doctor@meditrack.org"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border ${
                    errors.email ? 'border-red-400' : 'border-slate-200'
                  } outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Availability & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Consultation Schedule
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Mon - Fri, 09:00 - 17:00"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition"
              />
            </div>
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
              <span>{initialData ? 'Save Changes' : 'Register Doctor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
