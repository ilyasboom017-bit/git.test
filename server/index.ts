import express from 'express';
import cors from 'cors';
import db, { initializeDB } from './database.js';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Database
initializeDB();

// --- Settings API ---
app.post('/api/settings/verify-code', (req, res) => {
  const { code } = req.body;
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('loginCode') as { value: string };
  if (row && row.value === code) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Invalid code' });
  }
});

app.put('/api/settings/update-code', (req, res) => {
  const { newCode, currentCode } = req.body;
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('loginCode') as { value: string };
  if (row && row.value === currentCode) {
    db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(newCode, 'loginCode');
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Invalid current code' });
  }
});

// --- Data Fetch API ---
app.get('/api/data', (req, res) => {
  const roomsRaw = db.prepare('SELECT * FROM rooms').all();
  const rooms = roomsRaw.map((r: any) => ({ ...r, amenities: JSON.parse(r.amenities) }));
  
  const guests = db.prepare('SELECT * FROM guests').all();
  const bookings = db.prepare('SELECT * FROM bookings').all();
  
  res.json({ rooms, guests, bookings });
});

// --- Rooms API ---
app.post('/api/rooms', (req, res) => {
  const { id, number, type, status, pricePerNight, capacity, amenities } = req.body;
  
  const stmt = db.prepare('INSERT INTO rooms (id, number, type, status, pricePerNight, capacity, amenities) VALUES (?, ?, ?, ?, ?, ?, ?)');
  stmt.run(id, number, type, status, pricePerNight, capacity, JSON.stringify(amenities || []));
  
  res.json({ success: true });
});

app.put('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  const { number, type, status, pricePerNight, capacity, amenities } = req.body;
  
  const stmt = db.prepare('UPDATE rooms SET number = ?, type = ?, status = ?, pricePerNight = ?, capacity = ?, amenities = ? WHERE id = ?');
  stmt.run(number, type, status, pricePerNight, capacity, JSON.stringify(amenities || []), id);
  
  res.json({ success: true });
});

app.delete('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM rooms WHERE id = ?').run(id);
  res.json({ success: true });
});

// --- Guests API ---
app.post('/api/guests', (req, res) => {
  const { id, firstName, lastName, email, phone, nationality, totalStays, notes } = req.body;
  
  const stmt = db.prepare('INSERT INTO guests (id, firstName, lastName, email, phone, nationality, totalStays, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  stmt.run(id, firstName, lastName, email, phone, nationality, totalStays, notes);
  
  res.json({ success: true });
});

app.put('/api/guests/:id', (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, phone, nationality, totalStays, notes } = req.body;
  
  const stmt = db.prepare('UPDATE guests SET firstName = ?, lastName = ?, email = ?, phone = ?, nationality = ?, totalStays = ?, notes = ? WHERE id = ?');
  stmt.run(firstName, lastName, email, phone, nationality, totalStays, notes, id);
  
  res.json({ success: true });
});

app.delete('/api/guests/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM guests WHERE id = ?').run(id);
  res.json({ success: true });
});

// --- Bookings API ---
app.post('/api/bookings', (req, res) => {
  const { id, guestId, roomId, checkInDate, checkOutDate, status, paymentStatus, paymentMethod, totalPrice, numberOfGuests, createdAt } = req.body;
  
  const stmt = db.prepare('INSERT INTO bookings (id, guestId, roomId, checkInDate, checkOutDate, status, paymentStatus, paymentMethod, totalPrice, numberOfGuests, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  stmt.run(id, guestId, roomId, checkInDate, checkOutDate, status, paymentStatus, paymentMethod, totalPrice, numberOfGuests, createdAt);
  
  res.json({ success: true });
});

app.put('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { guestId, roomId, checkInDate, checkOutDate, status, paymentStatus, paymentMethod, totalPrice, numberOfGuests, createdAt } = req.body;
  
  const stmt = db.prepare('UPDATE bookings SET guestId = ?, roomId = ?, checkInDate = ?, checkOutDate = ?, status = ?, paymentStatus = ?, paymentMethod = ?, totalPrice = ?, numberOfGuests = ?, createdAt = ? WHERE id = ?');
  stmt.run(guestId, roomId, checkInDate, checkOutDate, status, paymentStatus, paymentMethod, totalPrice, numberOfGuests, createdAt, id);
  
  res.json({ success: true });
});

app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM bookings WHERE id = ?').run(id);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT as number, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
