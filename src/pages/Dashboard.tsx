import React, { useMemo } from 'react';
import { 
  BedDouble, DoorOpen, DoorClosed, CalendarCheck, Users, CalendarDays,
  TrendingUp, ArrowRight, LogIn, LogOut, Clock, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Room } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { rooms, bookings, guests, t } = useAppContext();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // ── Core Stats (all driven by real data) ──────────────────────────────────
  const checkedInBookings = bookings.filter(b => b.status === 'Checked In');
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed');
  const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
  const availableRooms = rooms.filter(r => r.status === 'Available').length;
  const cleaningRooms = rooms.filter(r => r.status === 'Cleaning').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance').length;

  // People currently inside
  const peopleInside = checkedInBookings.reduce((s, b) => s + (b.numberOfGuests || 1), 0);

  // Today's arrivals and departures
  const todayArrivals = bookings.filter(b => b.checkInDate.startsWith(todayStr));
  const todayDepartures = bookings.filter(b => b.checkOutDate.startsWith(todayStr));

  // Upcoming (next 7 days)
  const upcomingDate = new Date(today); upcomingDate.setDate(today.getDate() + 7);
  const upcomingReservations = confirmedBookings.filter(b => {
    const d = new Date(b.checkInDate);
    return d >= today && d <= upcomingDate;
  });

  // Total revenue
  const totalRevenue = bookings.reduce((s, b) => s + (b.totalPrice || 0), 0);
  const paidRevenue = bookings.filter(b => b.paymentStatus === 'Paid').reduce((s, b) => s + (b.totalPrice || 0), 0);

  // Occupancy rate %
  const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;

  // ── Chart Data ─────────────────────────────────────────────────────────────
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const dailyStats = last7Days.map(date => {
    const dayBookings = bookings.filter(b => b.checkInDate.startsWith(date));
    const revenue = dayBookings.reduce((s, b) => s + (b.totalPrice || 0), 0);
    const guests = dayBookings.reduce((s, b) => s + (b.numberOfGuests || 1), 0);
    return {
      date: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
      bookings: dayBookings.length,
      revenue,
      guests
    };
  });

  const occupancyPie = [
    { name: t('status.occupied'), value: occupiedRooms, color: '#f97316' },
    { name: t('status.available'), value: availableRooms, color: '#10b981' },
    { name: t('status.cleaning'), value: cleaningRooms, color: '#3b82f6' },
    { name: t('status.maintenance'), value: maintenanceRooms, color: '#f43f5e' }
  ].filter(d => d.value > 0);

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Occupied': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Cleaning': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Maintenance': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20';
    }
  };

  const getStatusIcon = (status: Room['status']) => {
    switch (status) {
      case 'Available': return <DoorOpen className="w-4 h-4 text-emerald-500" />;
      case 'Occupied': return <DoorClosed className="w-4 h-4 text-orange-500" />;
      case 'Cleaning': return <Sparkles className="w-4 h-4 text-blue-500" />;
      case 'Maintenance': return <AlertCircle className="w-4 h-4 text-rose-500" />;
    }
  };

  const handleNavigation = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-base">{t('dashboard.title')}</h1>
          <p className="text-text-muted mt-1">{today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button 
          onClick={() => handleNavigation('/bookings')}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2"
        >
          <CalendarDays className="w-4 h-4" />
          {t('btn.newBooking')}
        </button>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Occupancy */}
        <div className="md:col-span-1 bg-bg-surface border border-border-subtle rounded-2xl p-5 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">{t('dashboard.occupancyRate')}</p>
            <p className="text-4xl font-bold text-text-base">{occupancyRate}<span className="text-xl text-text-muted">%</span></p>
            <p className="text-xs text-text-muted mt-2">{occupiedRooms} / {rooms.length} {t('nav.rooms')}</p>
          </div>
          <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full bg-orange-500/5 translate-x-6 translate-y-6" />
        </div>

        {/* People Inside */}
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{t('status.checkedIn')}</p>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-orange-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-text-base">{peopleInside}</p>
          <p className="text-xs text-text-muted mt-1">{checkedInBookings.length} {t('nav.bookings').toLowerCase()}</p>
        </div>

        {/* Today Arrivals */}
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{t('dashboard.checkIns')}</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <LogIn className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-text-base">{todayArrivals.length}</p>
          <p className="text-xs text-text-muted mt-1">{t('dashboard.upcoming')}: {upcomingReservations.length}</p>
        </div>

        {/* Today Departures */}
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{t('dashboard.checkOuts')}</p>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <LogOut className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-text-base">{todayDepartures.length}</p>
          <p className="text-xs text-text-muted mt-1">{t('dashboard.totalGuests')}: {guests.length}</p>
        </div>
      </div>

      {/* Revenue + Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">{t('dashboard.estimatedRevenue')}</h2>
          <div>
            <p className="text-3xl font-bold text-text-base">{paidRevenue.toLocaleString()} <span className="text-sm font-normal text-text-muted">DZD</span></p>
            <p className="text-xs text-text-muted mt-1">{t('dashboard.totalRooms').replace('Total', '')} {totalRevenue.toLocaleString()} DZD total</p>
          </div>
          <div className="mt-auto space-y-2">
            <div className="flex justify-between text-xs text-text-muted">
              <span>{t('payment.paid')}</span>
              <span>{rooms.length > 0 && totalRevenue > 0 ? Math.round((paidRevenue / totalRevenue) * 100) : 0}%</span>
            </div>
            <div className="h-1.5 w-full bg-bg-surface-hover rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{ width: `${totalRevenue > 0 ? Math.round((paidRevenue / totalRevenue) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Weekly Bookings Chart */}
        <div className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">{t('dashboard.dailyBookings')}</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyStats} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-base)', borderRadius: 8 }}
                />
                <Area type="monotone" dataKey="bookings" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorBookings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Room Status + Today's Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart */}
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">{t('dashboard.roomStatus')}</h2>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={occupancyPie} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value">
                  {occupancyPie.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-base)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {occupancyPie.map((entry, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-text-muted">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>

        {/* Today's Arrivals & Departures */}
        <div className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">{t('dashboard.checkIns')} & {t('dashboard.checkOuts')}</h2>
            <button onClick={() => handleNavigation('/bookings')} className="text-xs text-orange-500 hover:text-orange-400 flex items-center gap-1">
              {t('dashboard.viewAll')} <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {[...todayArrivals.map(b => ({ ...b, direction: 'in' })), ...todayDepartures.map(b => ({ ...b, direction: 'out' }))].length === 0 ? (
              <div className="text-center py-8 text-text-muted text-sm">{t('dashboard.noGuest')}</div>
            ) : (
              [...todayArrivals.map(b => ({ ...b, direction: 'in' })), ...todayDepartures.map(b => ({ ...b, direction: 'out' }))].map((b, i) => {
                const guest = guests.find(g => g.id === b.guestId);
                const room = rooms.find(r => r.id === b.roomId);
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-bg-base border border-border-subtle hover:bg-bg-surface-hover transition-colors">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${b.direction === 'in' ? 'bg-emerald-500/10' : 'bg-blue-500/10'}`}>
                      {b.direction === 'in' ? <LogIn className="w-3.5 h-3.5 text-emerald-500" /> : <LogOut className="w-3.5 h-3.5 text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-base truncate">{guest?.firstName} {guest?.lastName}</p>
                      <p className="text-xs text-text-muted">{t('room.roomLabel')} {room?.number} · {b.numberOfGuests || 1} {t('room.guests')}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border ${b.direction === 'in' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-blue-500 bg-blue-500/10 border-blue-500/20'}`}>
                      {b.direction === 'in' ? t('date.checkIn') : t('date.checkOut')}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Room Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">{t('dashboard.roomStatus')}</h2>
          <button onClick={() => handleNavigation('/rooms')} className="text-xs text-orange-500 hover:text-orange-400 flex items-center gap-1">
            {t('dashboard.viewAll')} <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {rooms.map((room) => {
            const activeBooking = bookings.find(b => b.roomId === room.id && (b.status === 'Checked In' || b.status === 'Confirmed'));
            const guest = activeBooking ? guests.find(g => g.id === activeBooking.guestId) : null;
            return (
              <div key={room.id} className="bg-bg-surface border border-border-subtle rounded-2xl p-4 hover:border-border-strong transition-colors group cursor-pointer" onClick={() => handleNavigation('/rooms')}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-lg text-text-base">{room.number}</span>
                  {getStatusIcon(room.status)}
                </div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">{room.type}</p>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase tracking-wider ${getStatusColor(room.status)}`}>
                  {room.status === 'Available' ? t('status.available') : room.status === 'Occupied' ? t('status.occupied') : room.status === 'Cleaning' ? t('status.cleaning') : t('status.maintenance')}
                </span>
                {guest && (
                  <p className="text-[10px] text-text-muted mt-2 truncate">{guest.firstName} {guest.lastName}</p>
                )}
                {activeBooking && (
                  <p className="text-[10px] text-text-muted flex items-center gap-0.5">
                    <Users className="w-2.5 h-2.5" /> {activeBooking.numberOfGuests || 1}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
