import { Router } from 'express';
import { db } from './db.js';
import { seedDatabase } from './seed.js';

export const apiRouter = Router();

// ==========================================
// AUTHENTICATION
// ==========================================
apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.prepare('SELECT id, email, name, role, title, avatar_initials, password FROM users WHERE email = ?').get(email) as any;

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password. Please use admin@meditrack.demo / admin123' });
  }

  const { password: _, ...userData } = user;
  return res.json({ user: userData });
});

apiRouter.get('/auth/me', (req, res) => {
  const user = db.prepare('SELECT id, email, name, role, title, avatar_initials FROM users LIMIT 1').get() as any;
  if (!user) {
    return res.status(404).json({ error: 'No active user found.' });
  }
  return res.json({ user });
});

// ==========================================
// DASHBOARD STATS
// ==========================================
apiRouter.get('/dashboard/stats', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const patientCount = (db.prepare('SELECT COUNT(*) as count FROM patients').get() as any).count;
    const doctorCount = (db.prepare('SELECT COUNT(*) as count FROM doctors').get() as any).count;
    const todayRow = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE date = ? AND status != 'Cancelled'").get(today) as any;
    const todayAppointmentsCount = todayRow ? todayRow.count : 0;
    const prescriptionCount = (db.prepare('SELECT COUNT(*) as count FROM prescriptions').get() as any).count;

    // Recent & upcoming appointments with patient and doctor details
    const recentAppointments = db.prepare(`
      SELECT 
        a.id,
        a.date,
        a.time,
        a.reason,
        a.status,
        p.id as patient_id,
        p.name as patient_name,
        p.phone as patient_phone,
        d.id as doctor_id,
        d.name as doctor_name,
        d.title as doctor_title,
        d.specialization as doctor_specialization
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      ORDER BY a.date DESC, a.time DESC
      LIMIT 10
    `).all();

    // Specializations with doctor counts
    const specializations = db.prepare(`
      SELECT specialization, COUNT(*) as doctor_count
      FROM doctors
      GROUP BY specialization
      ORDER BY doctor_count DESC, specialization ASC
    `).all();

    return res.json({
      totalPatients: patientCount,
      totalDoctors: doctorCount,
      todayAppointments: todayAppointmentsCount,
      totalPrescriptions: prescriptionCount,
      recentAppointments,
      specializations,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ error: 'Failed to retrieve dashboard statistics.' });
  }
});

// ==========================================
// PATIENTS CRUD
// ==========================================
apiRouter.get('/patients', (req, res) => {
  try {
    const search = ((req.query.search as string) || '').trim().toLowerCase();
    const gender = (req.query.gender as string) || '';

    let query = `
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM appointments a WHERE a.patient_id = p.id) as appointment_count,
        (SELECT COUNT(*) FROM prescriptions pr WHERE pr.patient_id = p.id) as prescription_count
      FROM patients p
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (LOWER(p.name) LIKE ? OR p.phone LIKE ? OR CAST(p.id AS TEXT) LIKE ? OR LOWER(COALESCE(p.email, '')) LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (gender && gender !== 'All' && gender !== 'All Genders') {
      query += ` AND LOWER(p.gender) = LOWER(?)`;
      params.push(gender);
    }

    query += ` ORDER BY p.id DESC`;

    const patients = db.prepare(query).all(...params);
    return res.json(patients);
  } catch (err: any) {
    console.error('Error fetching patients:', err);
    return res.status(500).json({ error: 'Failed to fetch patients.' });
  }
});

apiRouter.get('/patients/:id', (req, res) => {
  try {
    const patientId = Number(req.params.id);
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    // Appointment history
    const appointments = db.prepare(`
      SELECT a.*, d.name as doctor_name, d.specialization as doctor_specialization
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.patient_id = ?
      ORDER BY a.date DESC, a.time DESC
    `).all(patientId);

    // Prescription history
    const prescriptions = db.prepare(`
      SELECT pr.*, d.name as doctor_name, d.specialization as doctor_specialization
      FROM prescriptions pr
      JOIN doctors d ON pr.doctor_id = d.id
      WHERE pr.patient_id = ?
      ORDER BY pr.issue_date DESC
    `).all(patientId);

    // Latest BMI Record
    const bmiRecord = db.prepare(`
      SELECT * FROM bmi_records WHERE patient_id = ? ORDER BY id DESC LIMIT 1
    `).get(patientId);

    return res.json({
      patient,
      appointments,
      prescriptions,
      bmiRecord,
    });
  } catch (err: any) {
    console.error('Error fetching patient details:', err);
    return res.status(500).json({ error: 'Failed to load patient history.' });
  }
});

apiRouter.post('/patients', (req, res) => {
  try {
    const { name, age, gender, phone, email, address, emergency_contact, blood_group, medical_history, height_cm, weight_kg } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Patient full name is required.' });
    }
    const parsedAge = Number(age);
    if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 150) {
      return res.status(400).json({ error: 'Valid age (0 - 150) is required.' });
    }
    if (!gender) {
      return res.status(400).json({ error: 'Gender selection is required.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'Valid phone contact is required.' });
    }

    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO patients (name, age, gender, phone, email, address, emergency_contact, blood_group, medical_history, height_cm, weight_kg, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      parsedAge,
      gender,
      phone.trim(),
      email ? email.trim() : null,
      address ? address.trim() : null,
      emergency_contact ? emergency_contact.trim() : null,
      blood_group ? blood_group.trim() : null,
      medical_history ? medical_history.trim() : null,
      height_cm ? Number(height_cm) : null,
      weight_kg ? Number(weight_kg) : null,
      now
    );

    const newPatient = db.prepare('SELECT * FROM patients WHERE id = ?').get(Number(result.lastInsertRowid));
    return res.status(201).json(newPatient);
  } catch (err: any) {
    console.error('Error adding patient:', err);
    return res.status(500).json({ error: 'Unable to save patient. Please try again.' });
  }
});

apiRouter.put('/patients/:id', (req, res) => {
  try {
    const patientId = Number(req.params.id);
    const { name, age, gender, phone, email, address, emergency_contact, blood_group, medical_history, height_cm, weight_kg } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Patient full name is required.' });
    }
    const parsedAge = Number(age);
    if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 150) {
      return res.status(400).json({ error: 'Valid age (0 - 150) is required.' });
    }
    if (!gender) {
      return res.status(400).json({ error: 'Gender selection is required.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'Valid phone contact is required.' });
    }

    const stmt = db.prepare(`
      UPDATE patients 
      SET name = ?, age = ?, gender = ?, phone = ?, email = ?, address = ?, emergency_contact = ?, blood_group = ?, medical_history = ?, height_cm = ?, weight_kg = ?
      WHERE id = ?
    `);

    stmt.run(
      name.trim(),
      parsedAge,
      gender,
      phone.trim(),
      email ? email.trim() : null,
      address ? address.trim() : null,
      emergency_contact ? emergency_contact.trim() : null,
      blood_group ? blood_group.trim() : null,
      medical_history ? medical_history.trim() : null,
      height_cm ? Number(height_cm) : null,
      weight_kg ? Number(weight_kg) : null,
      patientId
    );

    const updated = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);
    return res.json(updated);
  } catch (err: any) {
    console.error('Error updating patient:', err);
    return res.status(500).json({ error: 'Unable to update patient. Please try again.' });
  }
});

apiRouter.delete('/patients/:id', (req, res) => {
  try {
    const patientId = Number(req.params.id);
    const existing = db.prepare('SELECT id FROM patients WHERE id = ?').get(patientId);
    if (!existing) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    db.prepare('DELETE FROM patients WHERE id = ?').run(patientId);
    return res.json({ success: true, message: 'Patient deleted successfully.' });
  } catch (err: any) {
    console.error('Error deleting patient:', err);
    return res.status(500).json({ error: 'Database operation failed while deleting patient.' });
  }
});

// ==========================================
// DOCTORS CRUD
// ==========================================
apiRouter.get('/doctors', (req, res) => {
  try {
    const search = ((req.query.search as string) || '').trim().toLowerCase();

    let query = `
      SELECT 
        d.*,
        (SELECT COUNT(*) FROM appointments a WHERE a.doctor_id = d.id AND a.status = 'Scheduled') as booked_appointments,
        (SELECT COUNT(*) FROM appointments a WHERE a.doctor_id = d.id) as total_appointments
      FROM doctors d
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (LOWER(d.name) LIKE ? OR LOWER(d.specialization) LIKE ? OR LOWER(d.department) LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY d.id ASC`;

    const doctors = db.prepare(query).all(...params);
    return res.json(doctors);
  } catch (err: any) {
    console.error('Error fetching doctors:', err);
    return res.status(500).json({ error: 'Failed to fetch doctors.' });
  }
});

apiRouter.get('/doctors/:id', (req, res) => {
  try {
    const doctorId = Number(req.params.id);
    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }

    const appointments = db.prepare(`
      SELECT a.*, p.name as patient_name, p.phone as patient_phone
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.doctor_id = ?
      ORDER BY a.date DESC, a.time DESC
    `).all(doctorId);

    return res.json({ doctor, appointments });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve doctor details.' });
  }
});

apiRouter.post('/doctors', (req, res) => {
  try {
    const { name, title, specialization, phone, email, department, availability, experience_years } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Doctor full name is required.' });
    }
    if (!specialization || !specialization.trim()) {
      return res.status(400).json({ error: 'Doctor specialization is required.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'Contact phone is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Official email is required.' });
    }

    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO doctors (name, title, specialization, phone, email, department, availability, experience_years, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      title ? title.trim() : 'Licensed Practitioner',
      specialization.trim(),
      phone.trim(),
      email.trim(),
      department ? department.trim() : specialization.trim(),
      availability ? availability.trim() : 'Mon - Fri, 09:00 - 17:00',
      experience_years ? Number(experience_years) : 5,
      now
    );

    const newDoctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(Number(result.lastInsertRowid));
    return res.status(201).json(newDoctor);
  } catch (err: any) {
    console.error('Error adding doctor:', err);
    return res.status(500).json({ error: 'Unable to save doctor. Please try again.' });
  }
});

apiRouter.put('/doctors/:id', (req, res) => {
  try {
    const doctorId = Number(req.params.id);
    const { name, title, specialization, phone, email, department, availability, experience_years } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Doctor name is required.' });
    }
    if (!specialization || !specialization.trim()) {
      return res.status(400).json({ error: 'Specialization is required.' });
    }

    const stmt = db.prepare(`
      UPDATE doctors 
      SET name = ?, title = ?, specialization = ?, phone = ?, email = ?, department = ?, availability = ?, experience_years = ?
      WHERE id = ?
    `);

    stmt.run(
      name.trim(),
      title ? title.trim() : 'Licensed Practitioner',
      specialization.trim(),
      phone.trim(),
      email.trim(),
      department ? department.trim() : specialization.trim(),
      availability ? availability.trim() : 'Mon - Fri, 09:00 - 17:00',
      experience_years ? Number(experience_years) : 5,
      doctorId
    );

    const updated = db.prepare('SELECT * FROM doctors WHERE id = ?').get(doctorId);
    return res.json(updated);
  } catch (err: any) {
    console.error('Error updating doctor:', err);
    return res.status(500).json({ error: 'Unable to update doctor.' });
  }
});

apiRouter.delete('/doctors/:id', (req, res) => {
  try {
    const doctorId = Number(req.params.id);
    const existing = db.prepare('SELECT id FROM doctors WHERE id = ?').get(doctorId);
    if (!existing) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }

    db.prepare('DELETE FROM doctors WHERE id = ?').run(doctorId);
    return res.json({ success: true, message: 'Doctor deleted successfully.' });
  } catch (err: any) {
    console.error('Error deleting doctor:', err);
    return res.status(500).json({ error: 'Database operation failed while deleting doctor.' });
  }
});

// ==========================================
// APPOINTMENTS CRUD & CONFLICT DETECTION
// ==========================================
apiRouter.get('/appointments', (req, res) => {
  try {
    const search = ((req.query.search as string) || '').trim().toLowerCase();
    const status = (req.query.status as string) || '';
    const date = (req.query.date as string) || '';
    const doctorId = req.query.doctorId ? Number(req.query.doctorId) : null;

    let query = `
      SELECT 
        a.id,
        a.patient_id,
        a.doctor_id,
        a.date,
        a.time,
        a.reason,
        a.status,
        a.created_at,
        p.name as patient_name,
        p.phone as patient_phone,
        p.age as patient_age,
        p.gender as patient_gender,
        d.name as doctor_name,
        d.title as doctor_title,
        d.specialization as doctor_specialization,
        d.department as doctor_department
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (LOWER(p.name) LIKE ? OR LOWER(d.name) LIKE ? OR CAST(a.id AS TEXT) LIKE ? OR LOWER(COALESCE(a.reason, '')) LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status && status !== 'All' && status !== 'All Statuses') {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    if (date) {
      query += ` AND a.date = ?`;
      params.push(date);
    }

    if (doctorId) {
      query += ` AND a.doctor_id = ?`;
      params.push(doctorId);
    }

    query += ` ORDER BY a.date DESC, a.time DESC, a.id DESC`;

    const appointments = db.prepare(query).all(...params);
    return res.json(appointments);
  } catch (err: any) {
    console.error('Error fetching appointments:', err);
    return res.status(500).json({ error: 'Failed to fetch appointments.' });
  }
});

// BOOK APPOINTMENT WITH REAL CONFLICT DETECTION & AUTO-CREATE PATIENT
apiRouter.post('/appointments', (req, res) => {
  try {
    const { 
      patient_id, 
      patient_name, 
      doctor_id, 
      date, 
      time, 
      reason, 
      status, 
      new_patient_details, 
      force_new_patient 
    } = req.body;

    const trimmedPatientName = (patient_name || '').trim();

    if (!patient_id && !trimmedPatientName) {
      return res.status(400).json({ error: 'Please enter a patient name.' });
    }

    if (trimmedPatientName) {
      // Must contain at least one letter (reject inputs like only numbers "12345")
      if (!/[a-zA-Z]/.test(trimmedPatientName)) {
        return res.status(400).json({ error: 'Please enter a valid patient name containing letters.' });
      }
    }

    if (!doctor_id) {
      return res.status(400).json({ error: 'Please select a doctor.' });
    }
    if (!date || !date.trim()) {
      return res.status(400).json({ error: 'Appointment date is required.' });
    }
    if (!time || !time.trim()) {
      return res.status(400).json({ error: 'Appointment time is required.' });
    }

    // Standardize time format (HH:MM)
    const formattedTime = time.trim().substring(0, 5);
    const appointmentStatus = status || 'Scheduled';

    // REAL CONFLICT DETECTION - Executed BEFORE any patient insertion
    // Check if the selected doctor already has an active appointment at the exact same date and time
    if (appointmentStatus !== 'Cancelled') {
      const conflict = db.prepare(`
        SELECT a.id, p.name as existing_patient_name, d.name as doctor_name
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        WHERE a.doctor_id = ? 
          AND a.date = ? 
          AND SUBSTR(a.time, 1, 5) = ?
          AND a.status != 'Cancelled'
      `).get(Number(doctor_id), date.trim(), formattedTime) as any;

      if (conflict) {
        return res.status(409).json({
          error: 'Appointment conflict detected. This doctor already has an appointment at the selected date and time.',
          conflictDetails: {
            doctorName: conflict.doctor_name,
            date: date.trim(),
            time: formattedTime,
            existingPatient: conflict.existing_patient_name,
          },
        });
      }
    }

    const now = new Date().toISOString();
    let resolvedPatientId = patient_id ? Number(patient_id) : null;
    let isNewPatientCreated = false;

    // Smart Patient Matching:
    // If patient_name is supplied, check case-insensitive match against registered patients
    if (trimmedPatientName) {
      const existingPatient = db.prepare(`
        SELECT * FROM patients WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1
      `).get(trimmedPatientName) as any;

      if (existingPatient && !force_new_patient) {
        // Use existing patient record - no duplicate creation
        resolvedPatientId = existingPatient.id;
        isNewPatientCreated = false;
      } else if (!resolvedPatientId || force_new_patient) {
        // Create new permanent patient in database
        const parsedAge = new_patient_details?.age ? Number(new_patient_details.age) : 30;
        const pGender = new_patient_details?.gender || 'Other';
        const pPhone = new_patient_details?.phone && new_patient_details.phone.trim()
          ? new_patient_details.phone.trim()
          : 'Not provided';
        const pEmail = new_patient_details?.email && new_patient_details.email.trim()
          ? new_patient_details.email.trim()
          : null;

        const insertPatientStmt = db.prepare(`
          INSERT INTO patients (name, age, gender, phone, email, address, emergency_contact, blood_group, medical_history, height_cm, weight_kg, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const pResult = insertPatientStmt.run(
          trimmedPatientName,
          parsedAge,
          pGender,
          pPhone,
          pEmail,
          null,
          null,
          null,
          null,
          null,
          null,
          now
        );

        resolvedPatientId = Number(pResult.lastInsertRowid);
        isNewPatientCreated = true;
      }
    }

    if (!resolvedPatientId) {
      return res.status(400).json({ error: 'Unable to resolve patient record.' });
    }

    const stmt = db.prepare(`
      INSERT INTO appointments (patient_id, doctor_id, date, time, reason, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      resolvedPatientId,
      Number(doctor_id),
      date.trim(),
      formattedTime,
      reason ? reason.trim() : 'General Consultation',
      appointmentStatus,
      now
    );

    const newApt = db.prepare(`
      SELECT 
        a.*,
        p.name as patient_name,
        p.phone as patient_phone,
        d.name as doctor_name,
        d.title as doctor_title,
        d.specialization as doctor_specialization
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.id = ?
    `).get(Number(result.lastInsertRowid));

    return res.status(201).json({
      message: isNewPatientCreated
        ? 'New patient created and appointment scheduled successfully.'
        : 'Appointment scheduled successfully.',
      appointment: newApt,
      isNewPatient: isNewPatientCreated,
    });
  } catch (err: any) {
    console.error('Error booking appointment:', err);
    return res.status(500).json({ error: 'Unable to schedule appointment. Please try again.' });
  }
});

// EDIT APPOINTMENT WITH CONFLICT DETECTION
apiRouter.put('/appointments/:id', (req, res) => {
  try {
    const aptId = Number(req.params.id);
    const { patient_id, doctor_id, date, time, reason, status } = req.body;

    if (!patient_id || !doctor_id || !date || !time) {
      return res.status(400).json({ error: 'Patient, doctor, date, and time are required.' });
    }

    const formattedTime = time.trim().substring(0, 5);
    const appointmentStatus = status || 'Scheduled';

    // Conflict check (exclude current appointment)
    if (appointmentStatus !== 'Cancelled') {
      const conflict = db.prepare(`
        SELECT a.id, p.name as existing_patient_name, d.name as doctor_name
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        WHERE a.doctor_id = ? 
          AND a.date = ? 
          AND SUBSTR(a.time, 1, 5) = ?
          AND a.status != 'Cancelled'
          AND a.id != ?
      `).get(Number(doctor_id), date.trim(), formattedTime, aptId) as any;

      if (conflict) {
        return res.status(409).json({
          error: 'Appointment conflict detected. This doctor already has an appointment at the selected date and time.',
        });
      }
    }

    const stmt = db.prepare(`
      UPDATE appointments 
      SET patient_id = ?, doctor_id = ?, date = ?, time = ?, reason = ?, status = ?
      WHERE id = ?
    `);

    stmt.run(
      Number(patient_id),
      Number(doctor_id),
      date.trim(),
      formattedTime,
      reason ? reason.trim() : '',
      appointmentStatus,
      aptId
    );

    const updated = db.prepare(`
      SELECT 
        a.*,
        p.name as patient_name,
        p.phone as patient_phone,
        d.name as doctor_name,
        d.title as doctor_title,
        d.specialization as doctor_specialization
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.id = ?
    `).get(aptId);

    return res.json({
      message: 'Appointment updated successfully.',
      appointment: updated,
    });
  } catch (err: any) {
    console.error('Error updating appointment:', err);
    return res.status(500).json({ error: 'Unable to update appointment.' });
  }
});

// QUICK STATUS UPDATE (e.g. Complete or Cancel)
apiRouter.patch('/appointments/:id/status', (req, res) => {
  try {
    const aptId = Number(req.params.id);
    const { status } = req.body;

    if (!status || !['Scheduled', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid appointment status.' });
    }

    db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, aptId);
    return res.json({ success: true, message: `Appointment status updated to ${status}.` });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update status.' });
  }
});

apiRouter.delete('/appointments/:id', (req, res) => {
  try {
    const aptId = Number(req.params.id);
    db.prepare('DELETE FROM appointments WHERE id = ?').run(aptId);
    return res.json({ success: true, message: 'Appointment deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete appointment.' });
  }
});

// ==========================================
// PRESCRIPTION MANAGEMENT & RX SLIP
// ==========================================
apiRouter.get('/prescriptions', (req, res) => {
  try {
    const search = ((req.query.search as string) || '').trim().toLowerCase();

    let query = `
      SELECT 
        pr.id,
        pr.patient_id,
        pr.doctor_id,
        pr.diagnosis,
        pr.summary,
        pr.instructions,
        pr.issue_date,
        pr.created_at,
        p.name as patient_name,
        p.phone as patient_phone,
        p.age as patient_age,
        p.gender as patient_gender,
        d.name as doctor_name,
        d.specialization as doctor_specialization,
        (SELECT COUNT(*) FROM prescription_items pi WHERE pi.prescription_id = pr.id) as item_count
      FROM prescriptions pr
      JOIN patients p ON pr.patient_id = p.id
      JOIN doctors d ON pr.doctor_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (
        LOWER(p.name) LIKE ? OR 
        LOWER(d.name) LIKE ? OR 
        LOWER(COALESCE(pr.summary, '')) LIKE ? OR 
        LOWER(COALESCE(pr.diagnosis, '')) LIKE ? OR 
        CAST(pr.id AS TEXT) LIKE ? OR
        EXISTS (SELECT 1 FROM prescription_items pi WHERE pi.prescription_id = pr.id AND LOWER(pi.medicine_name) LIKE ?)
      )`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY pr.id DESC`;

    const prescriptions = db.prepare(query).all(...params);
    return res.json(prescriptions);
  } catch (err: any) {
    console.error('Error fetching prescriptions:', err);
    return res.status(500).json({ error: 'Failed to fetch prescription records.' });
  }
});

apiRouter.get('/prescriptions/:id', (req, res) => {
  try {
    const rxId = Number(req.params.id);
    const prescription = db.prepare(`
      SELECT 
        pr.*,
        p.name as patient_name,
        p.age as patient_age,
        p.gender as patient_gender,
        p.phone as patient_phone,
        p.email as patient_email,
        p.address as patient_address,
        p.blood_group as patient_blood_group,
        d.name as doctor_name,
        d.title as doctor_title,
        d.specialization as doctor_specialization,
        d.phone as doctor_phone,
        d.email as doctor_email,
        d.department as doctor_department
      FROM prescriptions pr
      JOIN patients p ON pr.patient_id = p.id
      JOIN doctors d ON pr.doctor_id = d.id
      WHERE pr.id = ?
    `).get(rxId) as any;

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription record not found.' });
    }

    const items = db.prepare(`
      SELECT * FROM prescription_items WHERE prescription_id = ? ORDER BY id ASC
    `).all(rxId);

    return res.json({
      ...prescription,
      items,
    });
  } catch (err: any) {
    console.error('Error fetching prescription details:', err);
    return res.status(500).json({ error: 'Failed to retrieve prescription details.' });
  }
});

apiRouter.post('/prescriptions', (req, res) => {
  try {
    const { patient_id, doctor_id, diagnosis, summary, instructions, issue_date, medicines } = req.body;

    if (!patient_id) {
      return res.status(400).json({ error: 'Patient selection is required.' });
    }
    if (!doctor_id) {
      return res.status(400).json({ error: 'Prescribing doctor is required.' });
    }
    if (!diagnosis || !diagnosis.trim()) {
      return res.status(400).json({ error: 'Clinical diagnosis is required.' });
    }
    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ error: 'At least one medicine must be specified.' });
    }

    const now = new Date().toISOString();
    const dateToUse = issue_date || now.split('T')[0];

    // Auto-generate summary from medicines if not provided
    const medicineSummary = summary && summary.trim() 
      ? summary.trim() 
      : medicines.map((m: any) => m.medicine_name).filter(Boolean).join(', ');

    const rxStmt = db.prepare(`
      INSERT INTO prescriptions (patient_id, doctor_id, diagnosis, summary, instructions, issue_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const rxResult = rxStmt.run(
      Number(patient_id),
      Number(doctor_id),
      diagnosis.trim(),
      medicineSummary,
      instructions ? instructions.trim() : null,
      dateToUse,
      now
    );

    const rxId = Number(rxResult.lastInsertRowid);

    const itemStmt = db.prepare(`
      INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration, instructions)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const med of medicines) {
      if (med.medicine_name && med.medicine_name.trim()) {
        itemStmt.run(
          rxId,
          med.medicine_name.trim(),
          med.dosage ? med.dosage.trim() : 'Standard dose',
          med.frequency ? med.frequency.trim() : 'As directed',
          med.duration ? med.duration.trim() : 'As needed',
          med.instructions ? med.instructions.trim() : null
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Prescription written and saved successfully.',
      prescriptionId: rxId,
    });
  } catch (err: any) {
    console.error('Error creating prescription:', err);
    return res.status(500).json({ error: 'Unable to save prescription.' });
  }
});

apiRouter.delete('/prescriptions/:id', (req, res) => {
  try {
    const rxId = Number(req.params.id);
    db.prepare('DELETE FROM prescription_items WHERE prescription_id = ?').run(rxId);
    db.prepare('DELETE FROM prescriptions WHERE id = ?').run(rxId);
    return res.json({ success: true, message: 'Prescription deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete prescription record.' });
  }
});

// ==========================================
// BMI & HEALTH METRICS STUDIO
// ==========================================
apiRouter.post('/bmi/calculate', (req, res) => {
  try {
    const { patient_id, height_cm, weight_kg, age, gender, save_record } = req.body;

    const height = Number(height_cm);
    const weight = Number(weight_kg);
    const userAge = age ? Number(age) : 30;
    const userGender = gender || 'Male';

    if (isNaN(height) || height <= 0 || height < 50 || height > 280) {
      return res.status(400).json({ error: 'Please enter a valid height between 50 and 280 cm.' });
    }
    if (isNaN(weight) || weight <= 0 || weight < 10 || weight > 400) {
      return res.status(400).json({ error: 'Please enter a valid weight between 10 and 400 kg.' });
    }

    // BMI = weight(kg) / (height(m))^2
    const heightM = height / 100;
    const bmiVal = weight / (heightM * heightM);
    const roundedBmi = Math.round(bmiVal * 10) / 10;

    // Category & Risk Level
    let category = 'Healthy / Normal';
    let riskLevel = 'Optimal / Low';
    if (roundedBmi < 18.5) {
      category = 'Underweight';
      riskLevel = 'Elevated Nutritional Risk';
    } else if (roundedBmi < 25.0) {
      category = 'Healthy / Normal';
      riskLevel = 'Optimal / Low';
    } else if (roundedBmi < 30.0) {
      category = 'Overweight';
      riskLevel = 'Moderate Cardiovascular Risk';
    } else {
      category = 'Obese';
      riskLevel = 'High Metabolic Risk';
    }

    // Ideal weight range for normal BMI (18.5 - 24.9)
    const minIdealWeight = Math.round(18.5 * heightM * heightM * 10) / 10;
    const maxIdealWeight = Math.round(24.9 * heightM * heightM * 10) / 10;

    // Basal Metabolic Rate (Mifflin-St Jeor Formula)
    // Men: 10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
    // Women: 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
    let bmr = (10 * weight) + (6.25 * height) - (5 * userAge);
    if (userGender.toLowerCase() === 'female') {
      bmr -= 161;
    } else {
      bmr += 5;
    }
    const roundedBmr = Math.round(bmr);

    // Recommended Daily Water Intake (~33ml per kg body weight)
    const waterLiters = Math.round((weight * 0.033) * 10) / 10;

    const result = {
      bmi: roundedBmi,
      category,
      idealWeightRange: `${minIdealWeight} – ${maxIdealWeight} kg`,
      bmr: roundedBmr,
      waterIntakeL: waterLiters,
      riskLevel,
    };

    // Save record if requested or patient is linked
    if (save_record || patient_id) {
      const now = new Date().toISOString();
      const insertBmi = db.prepare(`
        INSERT INTO bmi_records (patient_id, height_cm, weight_kg, age, gender, bmi, category, bmr, water_intake_l, risk_level, calculated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertBmi.run(
        patient_id ? Number(patient_id) : null,
        height,
        weight,
        userAge,
        userGender,
        roundedBmi,
        category,
        roundedBmr,
        waterLiters,
        riskLevel,
        now
      );

      // Also update patient's recorded height and weight if patient_id is present
      if (patient_id) {
        db.prepare('UPDATE patients SET height_cm = ?, weight_kg = ? WHERE id = ?').run(height, weight, Number(patient_id));
      }
    }

    return res.json(result);
  } catch (err: any) {
    console.error('Error calculating BMI:', err);
    return res.status(500).json({ error: 'Failed to compute health assessment.' });
  }
});

// ==========================================
// DEMO RESET & ENRICH
// ==========================================
apiRouter.post('/demo/reset', (req, res) => {
  try {
    seedDatabase(true);
    return res.json({ success: true, message: 'MediTrack database re-initialized with standard demo dataset.' });
  } catch (err: any) {
    console.error('Error resetting database:', err);
    return res.status(500).json({ error: 'Failed to reset demo dataset.' });
  }
});
