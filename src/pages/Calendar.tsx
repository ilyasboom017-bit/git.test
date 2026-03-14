import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Mail, Phone, FileText, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Booking, Guest } from '../types';

export const Calendar: React.FC = () => {
  const { rooms, bookings, guests, t } = useAppContext();
  const [startDate, setStartDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<{ booking: Booking, guest: Guest | undefined | null } | null>(null);

  // 14-day view
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    return d;
  });

  const handleNext = () => setStartDate(prev => { const n = new Date(prev); n.setDate(prev.getDate() + 14); return n; });
  const handlePrev = () => setStartDate(prev => { const p = new Date(prev); p.setDate(prev.getDate() - 14); return p; });
  const handleToday = () => setStartDate(new Date());

  const isBooked = (roomId: string, date: Date) => {
    return bookings.find(b => {
      const checkIn = new Date(b.checkInDate); checkIn.setHours(0,0,0,0);
      const checkOut = new Date(b.checkOutDate); checkOut.setHours(0,0,0,0);
      const current = new Date(date); current.setHours(0,0,0,0);
      return b.roomId === roomId && current >= checkIn && current < checkOut;
    });
  };

  // Calculate total guests per day across all rooms
  const dailyGuestCount = useMemo(() => {
    return days.map(day => {
      const dayStr = day.toDateString();
      let total = 0;
      bookings.forEach(b => {
        const checkIn = new Date(b.checkInDate); checkIn.setHours(0,0,0,0);
        const checkOut = new Date(b.checkOutDate); checkOut.setHours(0,0,0,0);
        const current = new Date(day); current.setHours(0,0,0,0);
        if (current >= checkIn && current < checkOut) {
          total += b.numberOfGuests || 1;
        }
      });
      return total;
    });
  }, [days, bookings]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-base">{t('calendar.title')}</h1>
          <p className="text-text-muted mt-1">{t('calendar.subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-bg-surface border border-border-subtle rounded-xl p-1">
            <button onClick={handlePrev} className="p-1.5 text-text-muted hover:text-text-base hover:bg-bg-surface-hover rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-4 text-sm font-medium text-text-base flex items-center gap-2 min-w-[160px] justify-center">
              <CalendarIcon className="w-4 h-4 text-orange-500" />
              {startDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </div>
            <button onClick={handleNext} className="p-1.5 text-text-muted hover:text-text-base hover:bg-bg-surface-hover rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button onClick={handleToday} className="px-4 py-2 bg-bg-surface hover:bg-bg-surface-hover border border-border-strong text-text-base rounded-xl text-sm font-medium transition-colors">
            {t('calendar.today')}
          </button>
        </div>
      </div>

      <div className="bg-bg-surface backdrop-blur-xl border border-border-subtle rounded-2xl overflow-hidden overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header Row */}
          <div className="flex border-b border-border-subtle bg-bg-base">
            <div className="w-48 flex-shrink-0 p-4 border-r border-border-subtle font-medium text-sm text-text-muted flex items-center">
              {t('table.room')}
            </div>
            <div className="flex-1 flex">
              {days.map((day, i) => {
                const today = new Date();
                const isToday = day.toDateString() === today.toDateString();
                const isEvenMonth = day.getMonth() % 2 === 0;
                const bgClass = isEvenMonth ? 'bg-bg-base' : 'bg-bg-surface-hover';
                return (
                  <div key={i} className={`flex-1 min-w-[60px] p-2 text-center border-r border-border-subtle last:border-r-0 ${bgClass}`}>
                    <div className={`text-xs font-medium mb-1 ${isToday ? 'text-orange-500' : 'text-text-muted'}`}>
                      {day.toLocaleDateString(undefined, { weekday: 'short' })}
                    </div>
                    <div className={`text-sm ${isToday ? 'text-orange-500 font-bold' : 'text-text-base'}`}>
                      {isToday
                        ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold">{day.getDate()}</span>
                        : day.getDate()
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Room Rows */}
          <div className="divide-y divide-border-subtle">
            {rooms.map(room => (
              <div key={room.id} className="flex hover:bg-bg-surface-hover transition-colors">
                <div className="w-48 flex-shrink-0 p-4 border-r border-border-subtle flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-text-base">{room.number}</span>
                    <span className="text-[10px] uppercase tracking-wider text-text-muted px-1.5 py-0.5 rounded bg-bg-surface-hover">{room.type}</span>
                  </div>
                </div>
                <div className="flex-1 flex relative">
                  {days.map((day, i) => {
                    const booking = isBooked(room.id, day);
                    const guest = booking ? guests.find(g => g.id === booking.guestId) : null;
                    const isStart = booking && new Date(booking.checkInDate).getDate() === day.getDate();
                    const today = new Date();
                    const isToday = day.toDateString() === today.toDateString();
                    const isEvenMonth = day.getMonth() % 2 === 0;
                    const bgClass = isEvenMonth ? 'bg-bg-base' : 'bg-bg-surface-hover';
                    return (
                      <div key={i} className={`flex-1 min-w-[60px] border-r border-border-subtle last:border-r-0 relative p-1 transition-colors ${bgClass}`}>
                        {booking && (
                          <button
                            onClick={() => setSelectedBooking({ booking, guest })}
                            className={`
                              absolute inset-y-1 left-0 right-0 z-10 
                              ${booking.status === 'Confirmed' ? 'bg-blue-500/20 border-blue-500/30 text-blue-500 hover:bg-blue-500/30' :
                                booking.status === 'Checked In' ? 'bg-orange-500/20 border-orange-500/30 text-orange-500 hover:bg-orange-500/30' :
                                'bg-emerald-500/20 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/30'}
                              border-y border-l border-r
                              ${isStart ? 'rounded-l-md ml-1' : 'border-l-0'}
                              flex items-center px-2 overflow-hidden cursor-pointer transition-colors text-left
                            `}>
                            {isStart && guest && (
                              <span className="text-[10px] font-medium truncate whitespace-nowrap">
                                {guest.firstName} {guest.lastName}
                                {booking.numberOfGuests > 1 && ` (${booking.numberOfGuests})`}
                              </span>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Daily Guest Count Footer Row */}
          <div className="flex border-t-2 border-border-strong bg-bg-base">
            <div className="w-48 flex-shrink-0 p-3 border-r border-border-subtle flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              {t('room.guests')}
            </div>
            <div className="flex-1 flex">
              {days.map((day, i) => {
                const count = dailyGuestCount[i];
                const today = new Date();
                const isToday = day.toDateString() === today.toDateString();
                return (
                  <div key={i} className={`flex-1 min-w-[60px] p-2 text-center border-r border-border-subtle last:border-r-0`}>
                    {count > 0 ? (
                      <span className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${isToday ? 'bg-orange-500 text-white' : 'bg-bg-surface-hover text-text-base'}`}>
                        {count}
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted opacity-30">—</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-text-muted px-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-blue-500/20 border border-blue-500/30"></div>
          <span>{t('status.confirmed')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-orange-500/20 border border-orange-500/30"></div>
          <span>{t('status.checkedIn')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/30"></div>
          <span>{t('status.checkedOut')}</span>
        </div>
      </div>

      {/* Guest Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-bg-surface border border-border-subtle rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border-subtle">
              <h2 className="text-lg font-semibold text-text-base">{t('calendar.bookingDetails')}</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-text-muted hover:text-text-base transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Customer Base Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold border border-orange-500/20 text-lg">
                  {selectedBooking.guest ? `${selectedBooking.guest.firstName[0]}${selectedBooking.guest.lastName[0]}` : '?'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-base">
                    {selectedBooking.guest ? `${selectedBooking.guest.firstName} ${selectedBooking.guest.lastName}` : t('modal.unknownGuest')}
                  </h3>
                  {selectedBooking.guest?.nationality && (
                    <span className="text-xs text-text-muted mt-0.5">{selectedBooking.guest.nationality}</span>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-bg-base border border-border-subtle rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-text-muted" />
                  <span className="text-text-base">{selectedBooking.guest?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-text-muted" />
                  <span className="text-text-base">{selectedBooking.guest?.phone || 'N/A'}</span>
                </div>
                {selectedBooking.booking.numberOfGuests > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="w-4 h-4 text-text-muted" />
                    <span className="text-text-base">{selectedBooking.booking.numberOfGuests} {t('room.guests')}</span>
                  </div>
                )}
              </div>

              {/* Booking Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-base border border-border-subtle rounded-xl p-4">
                  <span className="block text-xs text-text-muted mb-1">{t('modal.checkIn')}</span>
                  <span className="text-sm font-medium text-text-base">
                    {new Date(selectedBooking.booking.checkInDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="bg-bg-base border border-border-subtle rounded-xl p-4">
                  <span className="block text-xs text-text-muted mb-1">{t('modal.checkOut')}</span>
                  <span className="text-sm font-medium text-text-base">
                    {new Date(selectedBooking.booking.checkOutDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="bg-bg-base border border-border-subtle rounded-xl p-4">
                  <span className="block text-xs text-text-muted mb-1">{t('table.status')}</span>
                  <span className="text-sm font-medium text-text-base">
                    {selectedBooking.booking.status === 'Confirmed' ? t('status.confirmed') : selectedBooking.booking.status === 'Checked In' ? t('status.checkedIn') : selectedBooking.booking.status === 'Checked Out' ? t('status.checkedOut') : t('status.cancelled')}
                  </span>
                </div>
                <div className="bg-bg-base border border-border-subtle rounded-xl p-4">
                  <span className="block text-xs text-text-muted mb-1">{t('calendar.payment')}</span>
                  <span className="text-sm font-medium text-text-base">
                    {selectedBooking.booking.paymentStatus === 'Paid' ? t('payment.paid') : t('payment.pending')} ({selectedBooking.booking.paymentMethod === 'Cash' ? t('payment.cash') : t('payment.remote')})
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-bg-base border border-border-subtle rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-text-muted" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">{t('calendar.notes')}</span>
                </div>
                <p className="text-sm text-text-base leading-relaxed">
                  {selectedBooking.guest?.notes || <span className="italic opacity-50">{t('modal.noNotesProvided')}</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
