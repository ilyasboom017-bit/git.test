import { Booking, Guest, Room } from '../types';

export const mockRooms: Room[] = [
  { id: 'r1', number: '101', type: 'Standard', status: 'Occupied', pricePerNight: 80, capacity: 2, amenities: ['Wi-Fi', 'TV', 'AC'] },
  { id: 'r2', number: '102', type: 'Standard', status: 'Available', pricePerNight: 80, capacity: 2, amenities: ['Wi-Fi', 'TV', 'AC'] },
  { id: 'r3', number: '103', type: 'Deluxe', status: 'Cleaning', pricePerNight: 120, capacity: 2, amenities: ['Wi-Fi', 'TV', 'AC', 'Mini Bar'] },
  { id: 'r4', number: '104', type: 'Deluxe', status: 'Occupied', pricePerNight: 120, capacity: 2, amenities: ['Wi-Fi', 'TV', 'AC', 'Mini Bar'] },
  { id: 'r5', number: '201', type: 'Suite', status: 'Available', pricePerNight: 250, capacity: 4, amenities: ['Wi-Fi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Jacuzzi'] },
  { id: 'r6', number: '202', type: 'Suite', status: 'Occupied', pricePerNight: 250, capacity: 4, amenities: ['Wi-Fi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Jacuzzi'] },
  { id: 'r7', number: '203', type: 'Family', status: 'Available', pricePerNight: 180, capacity: 5, amenities: ['Wi-Fi', 'TV', 'AC', 'Kitchenette'] },
  { id: 'r8', number: '204', type: 'Family', status: 'Maintenance', pricePerNight: 180, capacity: 5, amenities: ['Wi-Fi', 'TV', 'AC', 'Kitchenette'] },
];

export const mockGuests: Guest[] = [
  { id: 'g1', firstName: 'Eleanor', lastName: 'Rigby', email: 'eleanor@example.com', phone: '+1 (555) 123-4567', totalStays: 3, notes: 'Prefers quiet rooms' },
  { id: 'g2', firstName: 'James', lastName: 'Bond', email: 'james.b@example.com', phone: '+44 7700 900077', totalStays: 1, notes: 'VIP Guest' },
  { id: 'g3', firstName: 'Sarah', lastName: 'Connor', email: 's.connor@example.com', phone: '+1 (555) 987-6543', totalStays: 5, notes: 'Late check-in usually' },
  { id: 'g4', firstName: 'Michael', lastName: 'Scott', email: 'm.scott@dundermifflin.com', phone: '+1 (555) 246-8101', totalStays: 2 },
  { id: 'g5', firstName: 'Amelie', lastName: 'Poulain', email: 'amelie@example.fr', phone: '+33 6 12 34 56 78', totalStays: 1 },
];

const today = new Date();
const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);
const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

export const mockBookings: Booking[] = [
  { id: 'b1', guestId: 'g1', roomId: 'r1', checkInDate: yesterday.toISOString(), checkOutDate: tomorrow.toISOString(), status: 'Checked In', totalPrice: 160, numberOfGuests: 1, createdAt: new Date(today.getTime() - 86400000 * 5).toISOString() },
  { id: 'b2', guestId: 'g2', roomId: 'r6', checkInDate: today.toISOString(), checkOutDate: nextWeek.toISOString(), status: 'Confirmed', totalPrice: 1750, numberOfGuests: 2, createdAt: new Date(today.getTime() - 86400000 * 10).toISOString() },
  { id: 'b3', guestId: 'g3', roomId: 'r4', checkInDate: new Date(today.getTime() - 86400000 * 2).toISOString(), checkOutDate: today.toISOString(), status: 'Checked In', totalPrice: 240, numberOfGuests: 2, createdAt: new Date(today.getTime() - 86400000 * 15).toISOString() },
  { id: 'b4', guestId: 'g4', roomId: 'r5', checkInDate: nextWeek.toISOString(), checkOutDate: new Date(nextWeek.getTime() + 86400000 * 3).toISOString(), status: 'Confirmed', totalPrice: 750, numberOfGuests: 4, createdAt: today.toISOString() },
  { id: 'b5', guestId: 'g5', roomId: 'r3', checkInDate: yesterday.toISOString(), checkOutDate: today.toISOString(), status: 'Checked Out', totalPrice: 120, numberOfGuests: 1, createdAt: new Date(today.getTime() - 86400000 * 20).toISOString() },
];
