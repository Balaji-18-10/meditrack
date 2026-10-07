import { 
  User, 
  Patient, 
  Doctor, 
  Appointment, 
  Prescription, 
  BmiAssessment, 
  DashboardStats 
} from '../types';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  return data as T;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    fetchJson<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => fetchJson<{ user: User }>('/api/auth/me'),

  // Dashboard Stats
  getDashboardStats: () => fetchJson<DashboardStats>('/api/dashboard/stats'),

  // Patients
  getPatients: (params?: { search?: string; gender?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.gender) query.append('gender', params.gender);
    return fetchJson<Patient[]>(`/api/patients?${query.toString()}`);
  },
  getPatientById: (id: number) =>
    fetchJson<{
      patient: Patient;
      appointments: Appointment[];
      prescriptions: Prescription[];
      bmiRecord?: any;
    }>(`/api/patients/${id}`),
  createPatient: (patient: Partial<Patient>) =>
    fetchJson<Patient>('/api/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    }),
  updatePatient: (id: number, patient: Partial<Patient>) =>
    fetchJson<Patient>(`/api/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patient),
    }),
  deletePatient: (id: number) =>
    fetchJson<{ success: boolean; message: string }>(`/api/patients/${id}`, {
      method: 'DELETE',
    }),

  // Doctors
  getDoctors: (params?: { search?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    return fetchJson<Doctor[]>(`/api/doctors?${query.toString()}`);
  },
  getDoctorById: (id: number) =>
    fetchJson<{ doctor: Doctor; appointments: Appointment[] }>(`/api/doctors/${id}`),
  createDoctor: (doctor: Partial<Doctor>) =>
    fetchJson<Doctor>('/api/doctors', {
      method: 'POST',
      body: JSON.stringify(doctor),
    }),
  updateDoctor: (id: number, doctor: Partial<Doctor>) =>
    fetchJson<Doctor>(`/api/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(doctor),
    }),
  deleteDoctor: (id: number) =>
    fetchJson<{ success: boolean; message: string }>(`/api/doctors/${id}`, {
      method: 'DELETE',
    }),

  // Appointments
  getAppointments: (params?: { search?: string; status?: string; date?: string; doctorId?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.date) query.append('date', params.date);
    if (params?.doctorId) query.append('doctorId', params.doctorId.toString());
    return fetchJson<Appointment[]>(`/api/appointments?${query.toString()}`);
  },
  createAppointment: (appointment: Partial<Appointment>) =>
    fetchJson<{ message: string; appointment: Appointment }>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment),
    }),
  updateAppointment: (id: number, appointment: Partial<Appointment>) =>
    fetchJson<{ message: string; appointment: Appointment }>(`/api/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointment),
    }),
  updateAppointmentStatus: (id: number, status: string) =>
    fetchJson<{ success: boolean; message: string }>(`/api/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deleteAppointment: (id: number) =>
    fetchJson<{ success: boolean; message: string }>(`/api/appointments/${id}`, {
      method: 'DELETE',
    }),

  // Prescriptions
  getPrescriptions: (params?: { search?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    return fetchJson<Prescription[]>(`/api/prescriptions?${query.toString()}`);
  },
  getPrescriptionById: (id: number) =>
    fetchJson<Prescription>(`/api/prescriptions/${id}`),
  createPrescription: (prescription: {
    patient_id: number;
    doctor_id: number;
    diagnosis: string;
    summary?: string;
    instructions?: string;
    issue_date?: string;
    medicines: Array<{
      medicine_name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions?: string;
    }>;
  }) =>
    fetchJson<{ success: boolean; message: string; prescriptionId: number }>(
      '/api/prescriptions',
      {
        method: 'POST',
        body: JSON.stringify(prescription),
      }
    ),
  deletePrescription: (id: number) =>
    fetchJson<{ success: boolean; message: string }>(`/api/prescriptions/${id}`, {
      method: 'DELETE',
    }),

  // BMI
  calculateBmi: (data: {
    patient_id?: number | null;
    height_cm: number;
    weight_kg: number;
    age?: number;
    gender?: string;
    save_record?: boolean;
  }) =>
    fetchJson<BmiAssessment>('/api/bmi/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Demo Reset
  resetDemoData: () =>
    fetchJson<{ success: boolean; message: string }>('/api/demo/reset', {
      method: 'POST',
    }),
};
