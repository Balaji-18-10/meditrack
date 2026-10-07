export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  title: string;
  avatar_initials: string;
}

export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string | null;
  address?: string | null;
  emergency_contact?: string | null;
  blood_group?: string | null;
  medical_history?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  created_at: string;
  appointment_count?: number;
  prescription_count?: number;
}

export interface Doctor {
  id: number;
  name: string;
  title: string;
  specialization: string;
  phone: string;
  email: string;
  department: string;
  availability: string;
  experience_years?: number;
  created_at: string;
  booked_appointments?: number;
  total_appointments?: number;
}

export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled';

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  date: string;
  time: string;
  reason?: string | null;
  status: AppointmentStatus;
  created_at: string;
  patient_name?: string;
  patient_phone?: string;
  patient_age?: number;
  patient_gender?: string;
  doctor_name?: string;
  doctor_title?: string;
  doctor_specialization?: string;
  doctor_department?: string;
  new_patient_details?: {
    age?: number | string;
    gender?: string;
    phone?: string;
    email?: string;
  };
  force_new_patient?: boolean;
}

export interface PrescriptionItem {
  id?: number;
  prescription_id?: number;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: number;
  patient_id: number;
  doctor_id: number;
  diagnosis: string;
  summary?: string;
  instructions?: string;
  issue_date: string;
  created_at: string;
  patient_name?: string;
  patient_phone?: string;
  patient_age?: number;
  patient_gender?: string;
  patient_email?: string;
  patient_address?: string;
  patient_blood_group?: string;
  doctor_name?: string;
  doctor_title?: string;
  doctor_specialization?: string;
  doctor_phone?: string;
  doctor_email?: string;
  doctor_department?: string;
  items?: PrescriptionItem[];
  item_count?: number;
}

export interface BmiAssessment {
  bmi: number;
  category: string;
  idealWeightRange: string;
  bmr: number;
  waterIntakeL: number;
  riskLevel: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  totalPrescriptions: number;
  recentAppointments: Appointment[];
  specializations: { specialization: string; doctor_count: number }[];
}
