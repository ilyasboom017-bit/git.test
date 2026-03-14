import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'hotel.sqlite'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize Schema
export const initializeDB = () => {
  // Settings
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Initialize default login code if not exists
  const hasLoginCode = db.prepare('SELECT 1 FROM settings WHERE key = ?').get('loginCode');
  if (!hasLoginCode) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('loginCode', '2026');
  }

  // Rooms
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      number TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      pricePerNight REAL NOT NULL,
      capacity INTEGER NOT NULL,
      amenities TEXT NOT NULL
    )
  `);

  // Guests
  db.exec(`
    CREATE TABLE IF NOT EXISTS guests (
      id TEXT PRIMARY KEY,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      nationality TEXT,
      totalStays INTEGER DEFAULT 0,
      notes TEXT
    )
  `);

  // Bookings
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      guestId TEXT NOT NULL,
      roomId TEXT NOT NULL,
      checkInDate TEXT NOT NULL,
      checkOutDate TEXT NOT NULL,
      status TEXT NOT NULL,
      totalPrice REAL NOT NULL,
      numberOfGuests INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(guestId) REFERENCES guests(id),
      FOREIGN KEY(roomId) REFERENCES rooms(id)
    )
  `);

  // Migrations for Phase 2: Payments
  try {
    db.exec(`ALTER TABLE bookings ADD COLUMN paymentStatus TEXT DEFAULT 'Pending'`);
  } catch (e: any) {
    // Ignore error if column already exists
    if (!e.message.includes('duplicate column name')) console.error(e);
  }

  try {
    db.exec(`ALTER TABLE bookings ADD COLUMN paymentMethod TEXT DEFAULT 'Cash'`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) console.error(e);
  }
};

export default db;
