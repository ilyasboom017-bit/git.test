import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Users, BedDouble, DollarSign, CalendarCheck, Download, Star } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

export const Reports: React.FC = () => {
  const { bookings, rooms, guests, t } = useAppContext();

  // ── Real Stats ─────────────────────────────────────────────────────────────
  const totalRevenue = useMemo(() => bookings.reduce((s, b) => s + (b.totalPrice || 0), 0), [bookings]);
  const paidRevenue = useMemo(() => bookings.filter(b => b.paymentStatus === 'Paid').reduce((s, b) => s + (b.totalPrice || 0), 0), [bookings]);
  const pendingRevenue = totalRevenue - paidRevenue;
  const totalBookings = bookings.length;
  const totalGuests = guests.length;
  const totalPeople = bookings.reduce((s, b) => s + (b.numberOfGuests || 1), 0);
  const activeRooms = rooms.filter(r => r.status !== 'Maintenance').length;
  const occupancyRate = rooms.length > 0 ? Math.round((rooms.filter(r => r.status === 'Occupied').length / rooms.length) * 100) : 0;
  const avgStay = useMemo(() => {
    if (!bookings.length) return 0;
    const total = bookings.reduce((s, b) => {
      const nights = Math.round((new Date(b.checkOutDate).getTime() - new Date(b.checkInDate).getTime()) / (1000 * 3600 * 24));
      return s + nights;
    }, 0);
    return (total / bookings.length).toFixed(1);
  }, [bookings]);

  // ── Last 30 days (weekly) ─────────────────────────────────────────────────
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  // Group into 4 weeks
  const weeklyData = useMemo(() => {
    const weeks: { week: string; revenue: number; bookings: number; guests: number }[] = [];
    for (let w = 0; w < 4; w++) {
      const slice = last30Days.slice(w * 7, (w + 1) * 7);
      const weekBookings = bookings.filter(b => slice.some(d => b.checkInDate.startsWith(d)));
      weeks.push({
        week: `W${w + 1}`,
        revenue: weekBookings.reduce((s, b) => s + (b.totalPrice || 0), 0),
        bookings: weekBookings.length,
        guests: weekBookings.reduce((s, b) => s + (b.numberOfGuests || 1), 0)
      });
    }
    return weeks;
  }, [bookings]);

  // ── Daily last 7 days ─────────────────────────────────────────────────────
  const dailyData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const ds = d.toISOString().split('T')[0];
      const count = bookings.filter(b => b.checkInDate.startsWith(ds)).length;
      return { date: d.toLocaleDateString(undefined, { weekday: 'short' }), bookings: count };
    });
  }, [bookings]);

  // ── Room performance ──────────────────────────────────────────────────────
  const roomStats = useMemo(() => {
    return rooms.map(room => {
      const rb = bookings.filter(b => b.roomId === room.id);
      const rev = rb.reduce((s, b) => s + (b.totalPrice || 0), 0);
      return { name: `${room.number}`, count: rb.length, revenue: rev, type: room.type };
    }).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [bookings, rooms]);

  // ── Status distribution ──────────────────────────────────────────────────-
  const statusDist = useMemo(() => {
    const map: Record<string, number> = {};
    bookings.forEach(b => { map[b.status] = (map[b.status] || 0) + 1; });
    const colors: Record<string, string> = { 'Confirmed': '#3b82f6', 'Checked In': '#f97316', 'Checked Out': '#10b981', 'Cancelled': '#f43f5e' };
    const labels: Record<string, string> = { 'Confirmed': t('status.confirmed'), 'Checked In': t('status.checkedIn'), 'Checked Out': t('status.checkedOut'), 'Cancelled': t('status.cancelled') };
    return Object.entries(map).map(([k, v]) => ({ name: labels[k] || k, value: v, color: colors[k] || '#64748b' }));
  }, [bookings]);

  // ── Payment breakdown ──────────────────────────────────────────────────────
  const cashCount = bookings.filter(b => b.paymentMethod === 'Cash').length;
  const remoteCount = bookings.filter(b => b.paymentMethod === 'Remote').length;

  const handleExport = () => {
    const rows = [
      ['Guest', 'Room', 'Check In', 'Check Out', 'Nights', 'Status', 'Payment', 'Total'],
      ...bookings.map(b => {
        const g = guests.find(x => x.id === b.guestId);
        const r = rooms.find(x => x.id === b.roomId);
        const nights = Math.round((new Date(b.checkOutDate).getTime() - new Date(b.checkInDate).getTime()) / (1000 * 3600 * 24));
        return [
          `${g?.firstName || ''} ${g?.lastName || ''}`.trim(),
          r?.number || '',
          b.checkInDate.split('T')[0],
          b.checkOutDate.split('T')[0],
          nights,
          b.status,
          b.paymentStatus,
          b.totalPrice
        ];
      })
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link.download = `report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const TOOLTIP_STYLE = {
    contentStyle: { backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-base)', borderRadius: 8, fontSize: 12 }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-base">{t('nav.reports')}</h1>
          <p className="text-text-muted mt-1">{t('settings.exportDesc')}</p>
        </div>
        <button onClick={handleExport} className="px-4 py-2 bg-bg-surface hover:bg-bg-surface-hover border border-border-strong text-text-base rounded-xl text-sm font-medium transition-colors flex items-center gap-2 w-fit">
          <Download className="w-4 h-4" />
          {t('btn.exportExcel')}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: t('dashboard.estimatedRevenue'), value: `${totalRevenue.toLocaleString()}`, sub: `DZD`, icon: DollarSign, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: t('payment.paid'), value: `${paidRevenue.toLocaleString()}`, sub: `DZD`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: t('bookings.title'), value: totalBookings, sub: `${t('dashboard.upcoming')} ${bookings.filter(b => b.status === 'Confirmed').length}`, icon: CalendarCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: t('dashboard.totalGuests'), value: totalGuests, sub: `${totalPeople} ${t('room.guests').toLocaleLowerCase()}`, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: t('rooms.title'), value: `${activeRooms}/${rooms.length}`, sub: `${occupancyRate}%`, icon: BedDouble, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Avg Stay', value: avgStay, sub: 'nights', icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((card, i) => (
          <div key={i} className="bg-bg-surface border border-border-subtle rounded-2xl p-4 flex flex-col gap-2">
            <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className="text-xl font-bold text-text-base">{card.value}</p>
            <div>
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{card.label}</p>
              <p className="text-[10px] text-text-muted">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue */}
        <div className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">{t('dashboard.estimatedRevenue')} (4 {t('dashboard.upcoming').toLowerCase()})</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                <XAxis dataKey="week" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `${v}`} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="revenue" name={t('dashboard.estimatedRevenue')} stroke="#f97316" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie */}
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">{t('table.status')}</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusDist} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value">
                  {statusDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {statusDist.map((e, i) => (
              <div key={i} className="flex items-center gap-1 text-[10px] text-text-muted">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                {e.name} ({e.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily bookings */}
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">{t('dashboard.dailyBookings')} (7 {t('dashboard.upcoming').toLowerCase()})</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="bookings" name={t('bookings.title')} fill="#a855f7" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room Performance */}
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">{t('rooms.title')}</h3>
          {roomStats.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-text-muted text-sm">{t('dashboard.noGuest')}</div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roomStats} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" horizontal={false} />
                  <XAxis type="number" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="count" name={t('bookings.title')} fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Payment Methods Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">{t('filter.paymentMethod')}</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-text-muted">{t('payment.cash')}</span>
                <span className="font-medium text-text-base">{cashCount} ({totalBookings > 0 ? Math.round(cashCount / totalBookings * 100) : 0}%)</span>
              </div>
              <div className="h-2 w-full bg-bg-surface-hover rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${totalBookings > 0 ? cashCount / totalBookings * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-text-muted">{t('payment.remote')}</span>
                <span className="font-medium text-text-base">{remoteCount} ({totalBookings > 0 ? Math.round(remoteCount / totalBookings * 100) : 0}%)</span>
              </div>
              <div className="h-2 w-full bg-bg-surface-hover rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${totalBookings > 0 ? remoteCount / totalBookings * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">{t('filter.paymentStatus')}</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-text-muted">{t('payment.paid')}</span>
                <span className="font-medium text-text-base">{paidRevenue.toLocaleString()} DZD</span>
              </div>
              <div className="h-2 w-full bg-bg-surface-hover rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalRevenue > 0 ? paidRevenue / totalRevenue * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-text-muted">{t('payment.pending')}</span>
                <span className="font-medium text-text-base">{pendingRevenue.toLocaleString()} DZD</span>
              </div>
              <div className="h-2 w-full bg-bg-surface-hover rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${totalRevenue > 0 ? pendingRevenue / totalRevenue * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
