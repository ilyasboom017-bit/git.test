export type RoomStatus = 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance';
export type RoomType = 'Standard' | 'Deluxe' | 'Suite' | 'Family';
export type BookingStatus = 'Confirmed' | 'Checked In' | 'Checked Out' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Pending';
export type PaymentMethod = 'Cash' | 'Remote';

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  status: RoomStatus;
  pricePerNight: number;
  capacity: number;
  amenities: string[];
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality?: string;
  totalStays: number;
  notes?: string;
}

export interface Booking {
  id: string;
  guestId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  numberOfGuests: number;
  createdAt: string;
}

export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  todayBookings: number;
  upcomingReservations: number;
  totalGuests: number;
}
