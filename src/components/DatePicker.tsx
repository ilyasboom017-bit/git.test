import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Booking } from '../types';
import { useAppContext } from '../context/AppContext';

interface DatePickerProps {
  label: string;
  value: string; // ISO string date YYYY-MM-DD
  onChange: (date: string) => void;
  roomId?: string; // If provided, block checking into booked dates
  bookings: Booking[];
  minDate?: string; // Optional minimum selectable date
}

export const DatePicker: React.FC<DatePickerProps> = ({ 
  label, value, onChange, roomId, bookings, minDate 
}) => {
  const { t, language } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse currently selected date, or default to today
  const selectedDate = value ? new Date(value) : new Date();
  
  // Maintain the month we are currently viewing
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const changeMonth = (offset: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const isDateBooked = (date: Date) => {
    if (!roomId) return false;
    
    // We only care about the date part (local timezone)
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return bookings.some(b => {
      if (b.roomId !== roomId || b.status === 'Cancelled') return false;
      
      const bIn = new Date(b.checkInDate);
      bIn.setHours(0, 0, 0, 0);
      
      const bOut = new Date(b.checkOutDate);
      bOut.setHours(0, 0, 0, 0);

      return checkDate >= bIn && checkDate < bOut;
    });
  };

  const isDateDisabled = (date: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    let isMinDisabled = false;
    if (minDate) {
      const md = new Date(minDate);
      md.setHours(0, 0, 0, 0);
      isMinDisabled = checkDate < md;
    }

    return isMinDisabled || isDateBooked(date);
  };

  // Generate calendar days for the current month view
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
    
    const days = [];
    
    // Previous month padding
    for (let i = 0; i < startingDayOfWeek; i++) {
        const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
        days.push({
            date: prevDate,
            isCurrentMonth: false,
            isDisabled: true // Prevent selecting padding days 
        });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        days.push({
            date,
            isCurrentMonth: true,
            isDisabled: isDateDisabled(date)
        });
    }
    
    return days;
  }, [currentMonth, roomId, bookings, minDate]);

  const handleSelectDate = (date: Date) => {
    // Format YYYY-MM-DD local
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    onChange(`${year}-${month}-${day}`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="text-xs font-medium text-text-muted mb-1 block">{label}</label>
      
      {/* Input Trigger */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-bg-base border border-border-strong rounded-xl px-3 py-2 text-sm text-text-base focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all flex items-center justify-between"
      >
        <span>
          {value ? new Date(value).toLocaleDateString() : 'Select date...'}
        </span>
        <CalendarIcon className="w-4 h-4 text-text-muted" />
      </button>

      {/* Popover */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-72 bg-bg-surface backdrop-blur-xl border border-border-subtle rounded-2xl p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button 
                type="button"
                onClick={() => changeMonth(-1)}
                className="p-1.5 hover:bg-bg-surface-hover rounded-lg transition-colors text-text-muted hover:text-text-base"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-sm font-semibold text-text-base">
                {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </div>
              <button 
                type="button"
                onClick={() => changeMonth(1)}
                className="p-1.5 hover:bg-bg-surface-hover rounded-lg transition-colors text-text-muted hover:text-text-base"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((_, i) => {
                const d = new Date(2024, 0, i + 7); // A Sunday-aligned week
                return (
                  <div key={i} className="text-center text-[10px] font-medium text-text-muted uppercase tracking-wider">
                    {d.toLocaleDateString(language, { weekday: 'short' })}
                  </div>
                );
              })}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((dayObj, i) => {
                const isSelected = value && dayObj.date.getTime() === selectedDate.getTime();
                
                let buttonClasses = "w-full aspect-square flex items-center justify-center text-sm rounded-lg transition-colors ";
                
                if (dayObj.isDisabled) {
                  buttonClasses += "opacity-30 cursor-not-allowed line-through ";
                } else if (isSelected) {
                  buttonClasses += "bg-orange-500 text-white font-medium shadow-sm shadow-orange-500/20 ";
                } else if (dayObj.isCurrentMonth) {
                  buttonClasses += "text-text-base hover:bg-bg-surface-hover ";
                } else {
                  buttonClasses += "text-text-muted opacity-50 ";
                }

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={dayObj.isDisabled}
                    onClick={() => handleSelectDate(dayObj.date)}
                    className={buttonClasses}
                    title={dayObj.isDisabled ? 'Room unavailable on this date' : ''}
                  >
                    {dayObj.date.getDate()}
                  </button>
                );
              })}
            </div>
            
            {/* Legend inside Popover */}
            {roomId && (
               <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-center gap-2">
                 <div className="w-2 h-2 rounded-full border border-text-base opacity-30"></div>
                 <span className="text-[10px] text-text-muted">{t('status.checkedIn') + '/' + t('status.confirmed')}</span>
               </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
