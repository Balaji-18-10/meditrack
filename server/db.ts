import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

// Store SQLite database file in the project root
const DB_FILE = path.resolve(process.cwd(), 'meditrack.db');
export const db = new DatabaseSync(DB_FILE);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      title TEXT NOT NULL,
      avatar_initials TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      emergency_contact TEXT,
      blood_group TEXT,
      medical_history TEXT,
      height_cm REAL,
      weight_kg REAL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      specialization TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      department TEXT NOT NULL,
      availability TEXT NOT NULL,
      experience_years INTEGER,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      reason TEXT,
      status TEXT NOT NULL CHECK(status IN ('Scheduled', 'Completed', 'Cancelled')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS prescriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
      diagnosis TEXT NOT NULL,
      summary TEXT,
      instructions TEXT,
      issue_date TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS prescription_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prescription_id INTEGER NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
      medicine_name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT NOT NULL,
      duration TEXT NOT NULL,
      instructions TEXT
    );

    CREATE TABLE IF NOT EXISTS bmi_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER REFERENCES patients(id) ON DELETE SET NULL,
      height_cm REAL NOT NULL,
      weight_kg REAL NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      bmi REAL NOT NULL,
      category TEXT NOT NULL,
      bmr REAL NOT NULL,
      water_intake_l REAL NOT NULL,
      risk_level TEXT NOT NULL,
      calculated_at TEXT NOT NULL
    );
  `);
}
