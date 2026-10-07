import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';
import { PatientModal } from './components/PatientModal';
import { PatientHistoryModal } from './components/PatientHistoryModal';
import { DoctorModal } from './components/DoctorModal';
import { AppointmentModal } from './components/AppointmentModal';
import { PrescriptionModal } from './components/PrescriptionModal';
import { RxSlipModal } from './components/RxSlipModal';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Doctors } from './pages/Doctors';
import { Appointments } from './pages/Appointments';
import { Prescriptions } from './pages/Prescriptions';
import { BmiStudio } from './pages/BmiStudio';

import { api } from './services/api';
import { 
  User, 
  Patient, 
  Doctor, 
  Appointment, 
  Prescription, 
  DashboardStats,
  AppointmentStatus 
} from './types';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Check localStorage for persisted session
    const saved = localStorage.getItem('meditrack_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default active user (matching Dr. John Sterling in screenshot)
    return {
      id: 1,
      name: 'Dr. John Sterling',
      email: 'admin@meditrack.demo',
      role: 'Administrator',
      title: 'Chief Administrator',
      avatar_initials: 'JS',
    };
  });

  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Core Data States
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Modals State
  const [patientModal, setPatientModal] = useState<{ isOpen: boolean; data: Patient | null }>({
    isOpen: false,
    data: null,
  });
  const [patientHistoryId, setPatientHistoryId] = useState<number | null>(null);

  const [doctorModal, setDoctorModal] = useState<{ isOpen: boolean; data: Doctor | null }>({
    isOpen: false,
    data: null,
  });

  const [appointmentModal, setAppointmentModal] = useState<{
    isOpen: boolean;
    data: Appointment | null;
    defaultDoctorId?: number;
  }>({
    isOpen: false,
    data: null,
  });

  const [prescriptionModal, setPrescriptionModal] = useState<{
    isOpen: boolean;
    defaultPatientId?: number;
  }>({
    isOpen: false,
  });

  const [activeRxSlipId, setActiveRxSlipId] = useState<number | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
  });

  // Fetch all core datasets
  const loadAllData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [statsRes, patientsRes, doctorsRes, aptsRes, rxRes] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getPatients().catch(() => []),
        api.getDoctors().catch(() => []),
        api.getAppointments().catch(() => []),
        api.getPrescriptions().catch(() => []),
      ]);

      if (statsRes) setDashboardStats(statsRes);
      setPatients(patientsRes);
      setDoctors(doctorsRes);
      setAppointments(aptsRes);
      setPrescriptions(rxRes);
    } catch (err: any) {
      console.error('Data load error:', err);
      addToast('error', 'Failed to synchronize with SQLite store.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('meditrack_user', JSON.stringify(user));
    addToast('success', `Welcome back, ${user.name}`);
    loadAllData();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('meditrack_user');
    addToast('info', 'Logged out of MediTrack healthcare console.');
  };

  // Demo Re-seed
  const handleResetDemo = async () => {
    try {
      setLoading(true);
      await api.resetDemoData();
      await loadAllData();
      addToast('success', 'MediTrack demo database restored successfully.');
    } catch (err: any) {
      addToast('error', 'Failed to re-seed database.');
    } finally {
      setLoading(false);
    }
  };

  // Patient Actions
  const handleSavePatient = async (data: Partial<Patient>) => {
    if (patientModal.data) {
      // Edit
      await api.updatePatient(patientModal.data.id, data);
      addToast('success', `Patient "${data.name}" updated successfully.`);
    } else {
      // Create
      await api.createPatient(data);
      addToast('success', `Patient "${data.name}" registered successfully.`);
    }
    loadAllData();
  };

  const handleDeletePatient = (patient: Patient) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Patient Record',
      message: `Are you sure you want to permanently delete "${patient.name}" (PID #${patient.id})? This will also remove associated appointments and prescriptions.`,
      action: async () => {
        await api.deletePatient(patient.id);
        addToast('success', `Patient #${patient.id} deleted successfully.`);
        loadAllData();
      },
    });
  };

  // Doctor Actions
  const handleSaveDoctor = async (data: Partial<Doctor>) => {
    if (doctorModal.data) {
      await api.updateDoctor(doctorModal.data.id, data);
      addToast('success', `Doctor "${data.name}" updated successfully.`);
    } else {
      await api.createDoctor(data);
      addToast('success', `Doctor "${data.name}" registered successfully.`);
    }
    loadAllData();
  };

  const handleDeleteDoctor = (doctor: Doctor) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Medical Specialist',
      message: `Are you sure you want to remove "${doctor.name}" from active staff?`,
      action: async () => {
        await api.deleteDoctor(doctor.id);
        addToast('success', `Doctor #${doctor.id} removed successfully.`);
        loadAllData();
      },
    });
  };

  // Appointment Actions
  const handleSaveAppointment = async (data: Partial<Appointment>) => {
    if (appointmentModal.data) {
      const res = await api.updateAppointment(appointmentModal.data.id, data);
      addToast('success', res.message || 'Appointment updated successfully.');
    } else {
      const res = await api.createAppointment(data);
      addToast('success', res.message || 'Appointment booked successfully.');
    }
    loadAllData();
  };

  const handleUpdateAppointmentStatus = async (id: number, status: AppointmentStatus) => {
    try {
      await api.updateAppointmentStatus(id, status);
      addToast('success', `Appointment marked as ${status}.`);
      loadAllData();
    } catch (err: any) {
      addToast('error', err.message || 'Failed to update status.');
    }
  };

  const handleDeleteAppointment = (apt: Appointment) => {
    setConfirmModal({
      isOpen: true,
      title: 'Cancel & Remove Appointment',
      message: `Are you sure you want to delete appointment #${apt.id} for ${apt.patient_name}?`,
      action: async () => {
        await api.deleteAppointment(apt.id);
        addToast('success', `Appointment #${apt.id} deleted.`);
        loadAllData();
      },
    });
  };

  // Prescription Actions
  const handleSavePrescription = async (data: any) => {
    const res = await api.createPrescription(data);
    addToast('success', 'Prescription written and saved successfully.');
    loadAllData();
    if (res.prescriptionId) {
      setActiveRxSlipId(res.prescriptionId);
    }
  };

  const handleDeletePrescription = (rx: Prescription) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Prescription Record',
      message: `Are you sure you want to delete Rx #${rx.id} for ${rx.patient_name}?`,
      action: async () => {
        await api.deletePrescription(rx.id);
        addToast('success', `Prescription #${rx.id} deleted.`);
        loadAllData();
      },
    });
  };

  // If unauthenticated, show professional login view
  if (!currentUser) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  // Calculate live counts for sidebar badges
  const sidebarCounts = {
    patients: dashboardStats?.totalPatients ?? patients.length,
    doctors: dashboardStats?.totalDoctors ?? doctors.length,
    appointments: dashboardStats?.todayAppointments ?? appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length,
    prescriptions: dashboardStats?.totalPrescriptions ?? prescriptions.length,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex">
      {/* Toast Alert Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Persistent Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        counts={sidebarCounts}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <TopHeader
          onOpenBookAppointment={() =>
            setAppointmentModal({ isOpen: true, data: null })
          }
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          globalSearch={globalSearch}
          setGlobalSearch={(query) => {
            setGlobalSearch(query);
            // If user enters search and is on dashboard, let them switch to patients
            if (query && currentTab === 'dashboard') {
              setCurrentTab('patients');
            }
          }}
        />

        {/* Dynamic Page Router */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              stats={dashboardStats}
              loading={loading}
              onRefresh={loadAllData}
              onResetDemo={handleResetDemo}
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenAddPatient={() => setPatientModal({ isOpen: true, data: null })}
              onOpenAddDoctor={() => setDoctorModal({ isOpen: true, data: null })}
              onOpenBookAppointment={() =>
                setAppointmentModal({ isOpen: true, data: null })
              }
              onEditAppointment={(apt) =>
                setAppointmentModal({ isOpen: true, data: apt })
              }
              onViewPatientHistory={(patientId) => setPatientHistoryId(patientId)}
            />
          )}

          {currentTab === 'patients' && (
            <Patients
              patients={patients}
              loading={loading}
              onRefresh={loadAllData}
              onOpenAddPatient={() => setPatientModal({ isOpen: true, data: null })}
              onEditPatient={(patient) => setPatientModal({ isOpen: true, data: patient })}
              onDeletePatient={handleDeletePatient}
              onViewHistory={(patientId) => setPatientHistoryId(patientId)}
            />
          )}

          {currentTab === 'doctors' && (
            <Doctors
              doctors={doctors}
              loading={loading}
              onRefresh={loadAllData}
              onOpenAddDoctor={() => setDoctorModal({ isOpen: true, data: null })}
              onEditDoctor={(doctor) => setDoctorModal({ isOpen: true, data: doctor })}
              onDeleteDoctor={handleDeleteDoctor}
              onScheduleWithDoctor={(doctorId) =>
                setAppointmentModal({
                  isOpen: true,
                  data: null,
                  defaultDoctorId: doctorId,
                })
              }
            />
          )}

          {currentTab === 'appointments' && (
            <Appointments
              appointments={appointments}
              loading={loading}
              onRefresh={loadAllData}
              onOpenBookAppointment={() =>
                setAppointmentModal({ isOpen: true, data: null })
              }
              onEditAppointment={(apt) =>
                setAppointmentModal({ isOpen: true, data: apt })
              }
              onDeleteAppointment={handleDeleteAppointment}
              onUpdateStatus={handleUpdateAppointmentStatus}
            />
          )}

          {currentTab === 'prescriptions' && (
            <Prescriptions
              prescriptions={prescriptions}
              loading={loading}
              onRefresh={loadAllData}
              onOpenWritePrescription={() =>
                setPrescriptionModal({ isOpen: true })
              }
              onViewRxSlip={(id) => setActiveRxSlipId(id)}
              onDeletePrescription={handleDeletePrescription}
            />
          )}

          {currentTab === 'bmi' && (
            <BmiStudio
              patients={patients}
              onBmiCalculated={loadAllData}
            />
          )}
        </main>

        {/* Professional Academic Disclaimer Footer */}
        <footer className="mt-auto py-5 px-6 border-t border-slate-200/70 text-center text-xs text-slate-400">
          <p>
            MediTrack – Java-Based Healthcare Management System (Web Prototype Edition)
          </p>
          <p className="mt-0.5 text-[11px]">
            Academic prototype with persistent SQLite store. Not intended for clinical diagnosis or production medical use.
          </p>
        </footer>
      </div>

      {/* Global Modals */}
      {/* 1. Add / Edit Patient Modal */}
      <PatientModal
        isOpen={patientModal.isOpen}
        onClose={() => setPatientModal({ isOpen: false, data: null })}
        onSubmit={handleSavePatient}
        initialData={patientModal.data}
      />

      {/* 2. Patient History & Timeline Modal */}
      <PatientHistoryModal
        patientId={patientHistoryId}
        onClose={() => setPatientHistoryId(null)}
        onSelectPrescription={(rxId) => setActiveRxSlipId(rxId)}
      />

      {/* 3. Add / Edit Doctor Modal */}
      <DoctorModal
        isOpen={doctorModal.isOpen}
        onClose={() => setDoctorModal({ isOpen: false, data: null })}
        onSubmit={handleSaveDoctor}
        initialData={doctorModal.data}
      />

      {/* 4. Book / Edit Appointment Modal (With Real Conflict Checking) */}
      <AppointmentModal
        isOpen={appointmentModal.isOpen}
        onClose={() =>
          setAppointmentModal({ isOpen: false, data: null, defaultDoctorId: undefined })
        }
        onSubmit={handleSaveAppointment}
        patients={patients}
        doctors={doctors}
        initialData={appointmentModal.data}
        defaultDoctorId={appointmentModal.defaultDoctorId}
      />

      {/* 5. Write Prescription Modal */}
      <PrescriptionModal
        isOpen={prescriptionModal.isOpen}
        onClose={() => setPrescriptionModal({ isOpen: false })}
        onSubmit={handleSavePrescription}
        patients={patients}
        doctors={doctors}
        defaultPatientId={prescriptionModal.defaultPatientId}
      />

      {/* 6. Printable Digital Rx Slip Modal */}
      <RxSlipModal
        prescriptionId={activeRxSlipId}
        onClose={() => setActiveRxSlipId(null)}
      />

      {/* 7. Destructive Action Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={async () => {
          try {
            await confirmModal.action();
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          } catch (err: any) {
            addToast('error', err.message || 'Operation failed.');
          }
        }}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
