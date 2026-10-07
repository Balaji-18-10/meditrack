import { db } from './db.js';

export function seedDatabase(force = false) {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (!force && userCount && userCount.count > 0) {
    return;
  }

  if (force) {
    db.exec(`
      DELETE FROM prescription_items;
      DELETE FROM prescriptions;
      DELETE FROM appointments;
      DELETE FROM bmi_records;
      DELETE FROM patients;
      DELETE FROM doctors;
      DELETE FROM users;
    `);
  }

  const now = new Date().toISOString();

  // 1. Seed demo user (Dr. John Sterling from screenshot)
  const insertUser = db.prepare(`
    INSERT INTO users (email, password, name, role, title, avatar_initials, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertUser.run(
    'admin@meditrack.demo',
    'admin123',
    'Dr. John Sterling',
    'Administrator',
    'Chief Administrator',
    'JS',
    now
  );

  // 2. Seed Doctors matching screenshot
  const insertDoctor = db.prepare(`
    INSERT INTO doctors (id, name, title, specialization, phone, email, department, availability, experience_years, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const doctorsData = [
    [1, 'Dr. Vijayakumar', 'Licensed Practitioner', 'Cardiologist', '9898989801', 'dr.vijay@meditrack.org', 'Cardiology', 'Mon - Fri, 09:00 - 17:00', 14],
    [3, 'Dr. Sarah Mitchell, MD', 'Licensed Practitioner', 'Cardiology', '+1 (555) 234-5678', 's.mitchell@meditrack.org', 'Cardiology', 'Mon - Thu, 08:30 - 16:30', 11],
    [4, 'Dr. Rajesh Sharma, MBBS', 'Licensed Practitioner', 'Pediatrics', '+1 (555) 987-6543', 'r.sharma@meditrack.org', 'Pediatrics', 'Tue - Sat, 10:00 - 18:00', 9],
    [5, 'Dr. Elena Rostova, MD, PhD', 'Licensed Practitioner', 'Neurology', '+1 (555) 345-9876', 'e.rostova@meditrack.org', 'Neurology', 'Mon - Fri, 08:00 - 15:00', 16],
    [6, 'Dr. Anthony Fauci, MD', 'Licensed Practitioner', 'General Medicine', '+1 (555) 876-5432', 'a.fauci@meditrack.org', 'Internal Medicine', 'Mon - Sat, 09:00 - 16:00', 25],
    [7, 'Dr. Maya Patel, DO', 'Licensed Practitioner', 'Dermatology', '+1 (555) 432-1098', 'm.patel@meditrack.org', 'Dermatology', 'Wed - Sun, 09:30 - 17:30', 8],
    [8, 'Dr. James Wilson, MD', 'Licensed Practitioner', 'Orthopedics', '+1 (555) 654-3210', 'j.wilson@meditrack.org', 'Orthopedics', 'Mon - Fri, 08:00 - 16:00', 12],
  ];

  for (const doc of doctorsData) {
    insertDoctor.run(doc[0], doc[1], doc[2], doc[3], doc[4], doc[5], doc[6], doc[7], doc[8], now);
  }

  // 3. Seed Patients matching screenshot
  const insertPatient = db.prepare(`
    INSERT INTO patients (id, name, age, gender, phone, email, address, emergency_contact, blood_group, medical_history, height_cm, weight_kg, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const patientsData = [
    [1, 'Yazhini', 19, 'Female', '9898989898', 'yazhini@demo.com', '74 Gandhi Rd, Chennai', '+91 98401 23456', 'O+', 'Mild migraine history, no known drug allergies.', 160, 52],
    [3, 'Eleanor Vance', 34, 'Female', '+1 (555) 234-5678', 'e.vance@example.com', '124 Beacon St, Boston, MA', '+1 (555) 998-1122', 'A+', 'Asthma (controlled with albuterol inhaler).', 168, 64],
    [4, 'Marcus Aurelius Brody', 48, 'Male', '+1 (555) 876-5432', 'm.brody@example.com', '512 Pinecrest Ave, Seattle, WA', '+1 (555) 887-3344', 'B+', 'Hypertension, managed with beta-blockers.', 180, 82],
    [5, 'Sofia Chen', 27, 'Female', '+1 (555) 345-9876', 's.chen@example.com', '88 University Ave, Palo Alto, CA', '+1 (555) 776-5544', 'AB+', 'Seasonal allergic rhinitis. Previous tonsillectomy.', 165, 58],
    [6, 'David K. Miller', 62, 'Male', '+1 (555) 456-1234', 'd.miller@example.com', '330 Elm Dr, Chicago, IL', '+1 (555) 665-4433', 'O-', 'Type 2 Diabetes, controlled via diet and metformin.', 175, 78],
    [7, 'Amina Al-Mansoor', 41, 'Female', '+1 (555) 678-8901', 'amina@example.com', '902 Horizon Way, Austin, TX', '+1 (555) 554-3322', 'A-', 'No significant medical history. Regular athletic checkup.', 162, 60],
    [8, 'Lucas Silva', 19, 'Male', '+1 (555) 789-2345', 'l.silva@example.com', '215 College St, New York, NY', '+1 (555) 443-2211', 'O+', 'Mild sports sprain (right ankle) 2025.', 178, 72],
    [10, 'kane', 27, 'Male', '9898989898', 'kane@example.com', '14 North Ridge Way, Denver, CO', '+1 (555) 332-1100', 'B-', 'No chronic conditions reported.', 175, 70],
  ];

  for (const pat of patientsData) {
    insertPatient.run(pat[0], pat[1], pat[2], pat[3], pat[4], pat[5], pat[6], pat[7], pat[8], pat[9], pat[10], pat[11], now);
  }

  // 4. Seed Appointments matching screenshot
  const insertAppointment = db.prepare(`
    INSERT INTO appointments (id, patient_id, doctor_id, date, time, reason, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const appointmentsData = [
    [1, 1, 1, '2026-06-15', '10:00', 'Routine cardiac rhythm checkup', 'Scheduled'],
    [2, 3, 3, '2026-06-15', '11:30', 'Follow-up on cardiovascular panel', 'Scheduled'],
    [3, 1, 1, '2026-09-21', '09:30', 'Electrocardiogram review', 'Completed'],
    [4, 8, 6, '2026-09-21', '11:00', 'Annual sports clearance physical', 'Scheduled'],
    [5, 3, 4, '2026-09-21', '14:15', 'Consultation on respiratory health', 'Completed'],
    [6, 4, 6, '2026-09-22', '10:00', 'Blood pressure monitoring review', 'Scheduled'],
    [7, 5, 5, '2026-09-22', '15:30', 'Neurological assessment for recurrent migraine', 'Scheduled'],
  ];

  for (const apt of appointmentsData) {
    insertAppointment.run(apt[0], apt[1], apt[2], apt[3], apt[4], apt[5], apt[6], now);
  }

  // 5. Seed Prescriptions matching screenshot
  const insertRx = db.prepare(`
    INSERT INTO prescriptions (id, patient_id, doctor_id, diagnosis, summary, instructions, issue_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRxItem = db.prepare(`
    INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration, instructions)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertRx.run(
    1,
    1,
    1,
    'Mild febrile episode with tension headache',
    'Dolo650',
    'Stay well hydrated. Rest adequately and avoid excessive screen strain.',
    '2026-10-01',
    now
  );

  insertRxItem.run(1, 'Dolo 650 (Paracetamol)', '650 mg', 'Twice daily after meals', '3 days', 'Take with plenty of water after food');
  insertRxItem.run(1, 'Pantoprazole', '40 mg', 'Once daily in the morning', '5 days', 'Take 30 minutes before breakfast');

  // Second sample prescription
  insertRx.run(
    2,
    5,
    5,
    'Acute episodic migraine without aura',
    'Sumatriptan & Magnesium',
    'Keep a headache trigger journal. Avoid caffeine spikes and erratic sleep schedules.',
    '2026-09-28',
    now
  );

  insertRxItem.run(2, 'Sumatriptan Succinate', '50 mg', 'As needed at migraine onset', '5 doses', 'Do not exceed 100 mg in 24 hours');
  insertRxItem.run(2, 'Magnesium Glycinate', '400 mg', 'Once daily at bedtime', '30 days', 'Take with a glass of water before sleeping');

  // 6. Seed BMI Record for kane (matching Screenshot 6: 175cm, 70kg, 30y, Male -> 22.9 BMI)
  const insertBmi = db.prepare(`
    INSERT INTO bmi_records (patient_id, height_cm, weight_kg, age, gender, bmi, category, bmr, water_intake_l, risk_level, calculated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertBmi.run(10, 175, 70, 30, 'Male', 22.9, 'Healthy / Normal', 1649, 2.3, 'Optimal / Low', now);
}
