import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Room, Guest, Booking } from '../types';
import { mockRooms, mockGuests, mockBookings } from '../data/mockData';
import { translations, Language, TranslationKey } from '../i18n/translations';

type Theme = 'dark' | 'light';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface AppContextType {
  rooms: Room[];
  guests: Guest[];
  bookings: Booking[];
  theme: Theme;
  language: Language;
  notifications: Notification[];
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (booking: Booking) => void;
  deleteBooking: (id: string) => void;
  addRoom: (room: Room) => void;
  updateRoom: (room: Room) => void;
  deleteRoom: (id: string) => void;
  addGuest: (guest: Guest) => void;
  updateGuest: (guest: Guest) => void;
  deleteGuest: (id: string) => void;
  t: (key: TranslationKey) => string;
  showNotification: (message: string, type?: 'success' | 'error') => void;
  removeNotification: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguage] = useState<Language>('en');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        if (data.rooms) setRooms(data.rooms);
        if (data.guests) setGuests(data.guests);
        if (data.bookings) setBookings(data.bookings);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedLang = localStorage.getItem('language') as Language;
    if (savedTheme) setTheme(savedTheme);
    if (savedLang) setLanguage(savedLang);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeNotification(id);
    }, 3000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // CRUD Operations
  const addBooking = (booking: Booking) => {
    setBookings(prev => [...prev, booking]);
    fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(booking) });
    showNotification(t('notify.saved'));
  };

  const updateBooking = (booking: Booking) => {
    setBookings(prev => prev.map(b => b.id === booking.id ? booking : b));
    fetch(`/api/bookings/${booking.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(booking) });
    showNotification(t('notify.saved'));
  };

  const deleteBooking = (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    fetch(`/api/bookings/${id}`, { method: 'DELETE' });
    showNotification(t('notify.deleted'));
  };

  const addRoom = (room: Room) => {
    setRooms(prev => [...prev, room]);
    fetch('/api/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(room) });
    showNotification(t('notify.saved'));
  };

  const updateRoom = (room: Room) => {
    setRooms(prev => prev.map(r => r.id === room.id ? room : r));
    fetch(`/api/rooms/${room.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(room) });
    showNotification(t('notify.saved'));
  };

  const deleteRoom = (id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id));
    fetch(`/api/rooms/${id}`, { method: 'DELETE' });
    showNotification(t('notify.deleted'));
  };

  const addGuest = (guest: Guest) => {
    setGuests(prev => [...prev, guest]);
    fetch('/api/guests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(guest) });
    showNotification(t('notify.saved'));
  };

  const updateGuest = (guest: Guest) => {
    setGuests(prev => prev.map(g => g.id === guest.id ? guest : g));
    fetch(`/api/guests/${guest.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(guest) });
    showNotification(t('notify.saved'));
  };

  const deleteGuest = (id: string) => {
    setGuests(prev => prev.filter(g => g.id !== id));
    fetch(`/api/guests/${id}`, { method: 'DELETE' });
    showNotification(t('notify.deleted'));
  };

  return (
    <AppContext.Provider value={{
      rooms, guests, bookings, theme, language, notifications,
      setTheme, setLanguage,
      addBooking, updateBooking, deleteBooking,
      addRoom, updateRoom, deleteRoom,
      addGuest, updateGuest, deleteGuest,
      t, showNotification, removeNotification
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
