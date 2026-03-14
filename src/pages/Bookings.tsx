import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, LogIn, LogOut, X, ArrowUpDown, ArrowUp, ArrowDown, Users, Save, Mail, Phone, FileText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Booking, Guest, Room } from '../types';
import { DatePicker } from '../components/DatePicker';
import { NationalitySelect } from '../components/NationalitySelect';

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

export const Bookings: React.FC = () => {
  const { bookings, guests, rooms, t, addBooking, updateBooking, deleteBooking, addGuest, updateGuest } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<{ booking: Booking, guest: Guest | null | undefined } | null>(null);

  // Inline notes editing
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    checkInDate: '',
    checkOutDate: '',
    roomId: '',
    numberOfGuests: 1,
    status: 'Confirmed' as Booking['status'],
    paymentStatus: 'Pending' as Booking['paymentStatus'],
    paymentMethod: 'Cash' as Booking['paymentMethod']
  });

  // Calculate occupancy: guests with status "Checked In"
  const occupancyStats = useMemo(() => {
    const checkedIn = bookings.filter(b => b.status === 'Checked In');
    const totalPeopleInside = checkedIn.reduce((sum, b) => sum + (b.numberOfGuests || 1), 0);
    return { bookingsCount: checkedIn.length, peopleCount: totalPeopleInside };
  }, [bookings]);

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'Confirmed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Checked In': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Checked Out': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Cancelled': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20';
    }
  };

  const handleOpenModal = (booking?: Booking) => {
    if (booking) {
      const guest = guests.find(g => g.id === booking.guestId);
      setFormData({
        firstName: guest?.firstName || '',
        lastName: guest?.lastName || '',
        email: guest?.email || '',
        phone: guest?.phone || '',
        nationality: guest?.nationality || '',
        checkInDate: booking.checkInDate.split('T')[0],
        checkOutDate: booking.checkOutDate.split('T')[0],
        roomId: booking.roomId,
        numberOfGuests: booking.numberOfGuests || 1,
        status: booking.status,
        paymentStatus: booking.paymentStatus || 'Pending',
        paymentMethod: booking.paymentMethod || 'Cash'
      });
      setEditingBooking(booking);
    } else {
      setFormData({
        firstName: '', lastName: '', email: '', phone: '', nationality: '',
        checkInDate: '', checkOutDate: '', roomId: '', numberOfGuests: 1,
        status: 'Confirmed', paymentStatus: 'Pending', paymentMethod: 'Cash'
      });
      setEditingBooking(null);
    }
    setIsModalOpen(true);
  };

  const handleSaveNote = (booking: Booking, guest: Guest | undefined) => {
    if (guest) {
      updateGuest({ ...guest, notes: notesDraft });
    }
    setEditingNoteId(null);
  };

  const handleSubmit = () => {
    let guestId = editingBooking ? editingBooking.guestId : '';
    
    if (!editingBooking) {
      guestId = `g${Date.now()}`;
      addGuest({
        id: guestId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        nationality: formData.nationality,
        totalStays: 1
      });
    } else {
      const existingGuest = guests.find(g => g.id === guestId);
      if (existingGuest) {
        updateGuest({
          ...existingGuest,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          nationality: formData.nationality
        });
      }
    }
    
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    
    if (checkOut <= checkIn) {
      alert(t('modal.checkOut') + ' > ' + t('modal.checkIn'));
      return;
    }
    
    const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)));
    const room = rooms.find(r => r.id === formData.roomId);
    const totalPrice = room ? room.pricePerNight * nights : 0;

    const newBooking: Booking = {
      id: editingBooking ? editingBooking.id : `b${Date.now()}`,
      guestId,
      roomId: formData.roomId,
      checkInDate: checkIn.toISOString(),
      checkOutDate: checkOut.toISOString(),
      status: formData.status,
      paymentStatus: formData.paymentStatus,
      paymentMethod: formData.paymentMethod,
      totalPrice,
      numberOfGuests: formData.numberOfGuests,
      createdAt: editingBooking ? editingBooking.createdAt : new Date().toISOString()
    };

    if (editingBooking) {
      updateBooking(newBooking);
    } else {
      addBooking(newBooking);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('modal.deleteConfirm'))) {
      deleteBooking(id);
    }
  };

  const handleAdvanceStatus = (booking: Booking) => {
    if (booking.status === 'Confirmed') {
      updateBooking({ ...booking, status: 'Checked In' });
    } else if (booking.status === 'Checked In') {
      updateBooking({ ...booking, status: 'Checked Out' });
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />;
  };

  const filteredAndSortedBookings = useMemo(() => {
    let result = bookings.filter(booking => {
      const guest = guests.find(g => g.id === booking.guestId);
      const room = rooms.find(r => r.id === booking.roomId);
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = !searchTerm ||
        guest?.firstName.toLowerCase().includes(searchLower) ||
        guest?.lastName.toLowerCase().includes(searchLower) ||
        room?.number.includes(searchLower);
      
      const matchesDate = filterDate
        ? booking.checkInDate.startsWith(filterDate) ||
          booking.checkOutDate.startsWith(filterDate) ||
          (new Date(booking.checkInDate) <= new Date(filterDate) && new Date(booking.checkOutDate) > new Date(filterDate))
        : true;
      const matchesRoom = filterRoom ? booking.roomId === filterRoom : true;
      const matchesStatus = filterStatus ? booking.status === filterStatus : true;

      return matchesSearch && matchesDate && matchesRoom && matchesStatus;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        const guestA = guests.find(g => g.id === a.guestId);
        const guestB = guests.find(g => g.id === b.guestId);
        const roomA = rooms.find(r => r.id === a.roomId);
        const roomB = rooms.find(r => r.id === b.roomId);

        let aValue: any = '';
        let bValue: any = '';

        switch (sortConfig.key) {
          case 'guest':
            aValue = guestA?.firstName || '';
            bValue = guestB?.firstName || '';
            break;
          case 'room':
            aValue = roomA?.number || '';
            bValue = roomB?.number || '';
            break;
          case 'checkIn':
            aValue = new Date(a.checkInDate).getTime();
            bValue = new Date(b.checkInDate).getTime();
            break;
          case 'nights':
            aValue = new Date(a.checkOutDate).getTime() - new Date(a.checkInDate).getTime();
            bValue = new Date(b.checkOutDate).getTime() - new Date(b.checkInDate).getTime();
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [bookings, guests, rooms, searchTerm, filterDate, filterRoom, filterStatus, sortConfig]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-base">{t('bookings.title')}</h1>
          <p className="text-text-muted mt-1">{t('bookings.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Live Occupancy Banner */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium">
            <Users className="w-4 h-4" />
            <span>{occupancyStats.peopleCount} {t('room.guests')}</span>
            <span className="text-orange-400/60">·</span>
            <span>{occupancyStats.bookingsCount} {t('status.checkedIn')}</span>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 w-fit"
          >
            <Plus className="w-4 h-4" />
            {t('btn.newBooking')}
          </button>
        </div>
      </div>

      <div className="bg-bg-surface backdrop-blur-xl border border-border-subtle rounded-2xl flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row gap-4 justify-between items-center bg-bg-surface-hover rounded-t-2xl">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder={t('bookings.search')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-bg-base border border-border-strong rounded-xl pl-10 pr-4 py-2 text-sm text-text-base placeholder:text-text-muted focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-colors ${showFilters ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-bg-base border-border-strong text-text-base hover:bg-bg-surface-hover'}`}
            >
              <Filter className="w-4 h-4" />
              {t('bookings.filter')}
            </button>
          </div>
        </div>

        {/* Extended Filters - uses its own stacking context so date picker popover is visible */}
        {showFilters && (
          <div className="relative z-20 p-4 border-b border-border-subtle bg-bg-base grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-200">
            <div className="relative">
              <DatePicker 
                label={t('filter.dateFilter')}
                value={filterDate}
                onChange={(date) => setFilterDate(date)}
                bookings={[]}
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className="absolute top-0 right-0 text-[10px] text-rose-500 hover:underline"
                >
                  ✕
                </button>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">{t('filter.room')}</label>
              <select 
                value={filterRoom}
                onChange={(e) => setFilterRoom(e.target.value)}
                className="w-full bg-bg-surface border border-border-strong rounded-xl px-3 py-2 text-sm text-text-base focus:border-orange-500/50 outline-none appearance-none"
              >
                <option value="">{t('filter.allRooms')}</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>{t('room.roomLabel')} {r.number}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">{t('table.status')}</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-bg-surface border border-border-strong rounded-xl px-3 py-2 text-sm text-text-base focus:border-orange-500/50 outline-none appearance-none"
              >
                <option value="">{t('filter.allStatuses')}</option>
                <option value="Confirmed">{t('status.confirmed')}</option>
                <option value="Checked In">{t('status.checkedIn')}</option>
                <option value="Checked Out">{t('status.checkedOut')}</option>
                <option value="Cancelled">{t('status.cancelled')}</option>
              </select>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-muted">
            <thead className="text-xs text-text-muted uppercase bg-bg-base border-b border-border-subtle">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider cursor-pointer hover:text-text-base transition-colors" onClick={() => handleSort('guest')}>
                  <div className="flex items-center">{t('table.guest')} {getSortIcon('guest')}</div>
                </th>
                <th className="px-6 py-4 font-medium tracking-wider cursor-pointer hover:text-text-base transition-colors" onClick={() => handleSort('room')}>
                  <div className="flex items-center">{t('table.room')} {getSortIcon('room')}</div>
                </th>
                <th className="px-6 py-4 font-medium tracking-wider cursor-pointer hover:text-text-base transition-colors" onClick={() => handleSort('checkIn')}>
                  <div className="flex items-center">{t('table.dates')} {getSortIcon('checkIn')}</div>
                </th>
                <th className="px-6 py-4 font-medium tracking-wider">{t('table.notes')}</th>
                <th className="px-6 py-4 font-medium tracking-wider cursor-pointer hover:text-text-base transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center">{t('table.status')} {getSortIcon('status')}</div>
                </th>
                <th className="px-6 py-4 font-medium tracking-wider text-right">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredAndSortedBookings.map((booking) => {
                const guest = guests.find(g => g.id === booking.guestId);
                const room = rooms.find(r => r.id === booking.roomId);
                
                const checkIn = new Date(booking.checkInDate);
                const checkOut = new Date(booking.checkOutDate);
                const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));

                const canAdvance = booking.status === 'Confirmed' || booking.status === 'Checked In';

                return (
                  <tr key={booking.id} className="hover:bg-bg-surface-hover transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => setSelectedBookingDetails({ booking, guest })}
                        className="flex flex-col text-left group/name hover:opacity-80 transition-opacity"
                      >
                        <span className="font-medium text-text-base group-hover/name:text-orange-500 transition-colors">{guest?.firstName} {guest?.lastName}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-text-muted">{guest?.phone}</span>
                          {guest?.nationality && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-surface-hover text-text-muted border border-border-subtle">
                              {guest.nationality}
                            </span>
                          )}
                          {booking.numberOfGuests > 1 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-0.5">
                              <Users className="w-2.5 h-2.5" />{booking.numberOfGuests}
                            </span>
                          )}
                        </div>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-text-base">{room?.number}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-bg-surface-hover text-text-muted">{room?.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col text-xs">
                        <span className="text-text-base">{t('date.checkIn')}: {checkIn.toLocaleDateString()}</span>
                        <span className="text-text-muted mt-0.5">{t('date.checkOut')}: {checkOut.toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingNoteId === booking.id ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            autoFocus
                            rows={2}
                            value={notesDraft}
                            onChange={e => setNotesDraft(e.target.value)}
                            className="w-full min-w-[150px] bg-bg-base border border-orange-500/40 rounded-xl px-2 py-1.5 text-xs text-text-base outline-none resize-none"
                          />
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleSaveNote(booking, guest)} className="px-2 py-0.5 bg-orange-500 text-white text-[10px] rounded-md"><Save className="w-3 h-3"/></button>
                            <button onClick={() => setEditingNoteId(null)} className="px-2 py-0.5 bg-bg-surface-hover text-text-muted text-[10px] rounded-md"><X className="w-3 h-3"/></button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => { setEditingNoteId(booking.id); setNotesDraft(guest?.notes || ''); }}
                          className="flex items-start gap-1.5 text-left group/note"
                        >
                          <FileText className="w-3 h-3 text-text-muted mt-0.5 group-hover/note:text-orange-500 transition-colors" />
                          <span className="text-xs text-text-muted truncate max-w-[120px]">
                            {guest?.notes || <span className="italic opacity-30">{t('modal.noNotes')}</span>}
                          </span>
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`w-fit px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(booking.status)}`}>
                          {booking.status === 'Confirmed' ? t('status.confirmed') : booking.status === 'Checked In' ? t('status.checkedIn') : booking.status === 'Checked Out' ? t('status.checkedOut') : t('status.cancelled')}
                        </span>
                        <div className="flex items-center gap-1 mt-1.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${booking.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {booking.paymentStatus === 'Paid' ? t('payment.paid') : t('payment.pending')}
                          </span>
                          <span className="text-[10px] text-text-muted border border-border-subtle px-1.5 py-0.5 rounded">
                            {booking.paymentMethod === 'Cash' ? t('payment.cash') : t('payment.remote')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Status advance button */}
                        {canAdvance && (
                          <button
                            onClick={() => handleAdvanceStatus(booking)}
                            className={`p-1.5 rounded-lg transition-colors ${booking.status === 'Confirmed' ? 'text-orange-500 hover:bg-orange-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                            title={booking.status === 'Confirmed' ? t('status.checkedIn') : t('status.checkedOut')}
                          >
                            {booking.status === 'Confirmed' ? <LogIn className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
                          </button>
                        )}
                        <button onClick={() => handleOpenModal(booking)} className="p-1.5 text-text-muted hover:text-text-base hover:bg-bg-surface-hover rounded-lg transition-colors" title={t('btn.edit')}>
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(booking.id)} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors" title={t('btn.delete')}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredAndSortedBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted text-sm">
                    {t('bookings.search')}...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New/Edit Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-bg-surface border border-border-subtle rounded-2xl w-full max-w-lg shadow-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-border-subtle rounded-t-2xl bg-bg-surface">
              <h2 className="text-lg font-semibold text-text-base">
                {editingBooking ? t('modal.editBooking') : t('modal.newBooking')}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-base transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">{t('modal.firstName')}</label>
                  <input 
                    type="text" 
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    className="w-full bg-bg-base border border-border-strong rounded-xl px-3 py-2 text-sm text-text-base focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">{t('modal.lastName')}</label>
                  <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    className="w-full bg-bg-base border border-border-strong rounded-xl px-3 py-2 text-sm text-text-base focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">{t('modal.email')}</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-bg-base border border-border-strong rounded-xl px-3 py-2 text-sm text-text-base focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">{t('modal.phone')}</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-bg-base border border-border-strong rounded-xl px-3 py-2 text-sm text-text-base focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">{t('modal.nationality')}</label>
                  <NationalitySelect 
                    value={formData.nationality}
                    onChange={nat => setFormData({...formData, nationality: nat})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">{t('modal.room')}</label>
                  <select 
                    value={formData.roomId}
                    onChange={e => setFormData({...formData, roomId: e.target.value})}
                    className="w-full bg-bg-base border border-border-strong rounded-xl px-3 py-2 text-sm text-text-base focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all appearance-none"
                  >
                    <option value="">{t('modal.selectRoom')}</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>{t('room.roomLabel')} {room.number} - {room.type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DatePicker 
                  label={t('modal.checkIn')}
                  value={formData.checkInDate}
                  onChange={date => setFormData({...formData, checkInDate: date})}
                  roomId={formData.roomId}
                  bookings={bookings}
                  minDate={new Date().toISOString().split('T')[0]}
                />
                <DatePicker 
                  label={t('modal.checkOut')}
                  value={formData.checkOutDate}
                  onChange={date => setFormData({...formData, checkOutDate: date})}
                  roomId={formData.roomId}
                  bookings={bookings}
                  minDate={formData.checkInDate || new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">{t('modal.capacity')}</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={formData.numberOfGuests}
                    onChange={e => setFormData({...formData, numberOfGuests: Number(e.target.value)})}
                    className="w-full bg-bg-base border border-border-strong rounded-xl px-3 py-2 text-sm text-text-base focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-medium text-text-muted">{t('modal.status')}</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as Booking['status']})}
                    className="w-full bg-bg-base border border-border-strong rounded-xl px-3 py-2 text-sm text-text-base focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all appearance-none"
                  >
                    <option value="Confirmed">{t('status.confirmed')}</option>
                    <option value="Checked In">{t('status.checkedIn')}</option>
                    <option value="Checked Out">{t('status.checkedOut')}</option>
                    <option value="Cancelled">{t('status.cancelled')}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">{t('modal.paymentStatus')}</label>
                  <select 
                    value={formData.paymentStatus}
                    onChange={e => setFormData({...formData, paymentStatus: e.target.value as Booking['paymentStatus']})}
                    className="w-full bg-bg-base border border-border-strong rounded-xl px-3 py-2 text-sm text-text-base focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all appearance-none"
                  >
                    <option value="Paid">{t('payment.paid')}</option>
                    <option value="Pending">{t('payment.pending')}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">{t('modal.paymentMethod')}</label>
                  <select 
                    value={formData.paymentMethod}
                    onChange={e => setFormData({...formData, paymentMethod: e.target.value as Booking['paymentMethod']})}
                    className="w-full bg-bg-base border border-border-strong rounded-xl px-3 py-2 text-sm text-text-base focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all appearance-none"
                  >
                    <option value="Cash">{t('payment.cash')}</option>
                    <option value="Remote">{t('payment.remote')}</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border-subtle flex justify-end gap-3 bg-bg-surface-hover rounded-b-2xl">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-transparent hover:bg-bg-surface border border-border-strong text-text-base rounded-xl text-sm font-medium transition-colors"
              >
                {t('btn.cancel')}
              </button>
              <button 
                onClick={handleSubmit}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-orange-500/20 transition-all"
              >
                {t('btn.save')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Guest Details Modal / Card */}
      {selectedBookingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-bg-surface border border-border-subtle rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border-subtle">
              <h2 className="text-lg font-semibold text-text-base">{t('calendar.bookingDetails')}</h2>
              <button 
                onClick={() => setSelectedBookingDetails(null)}
                className="text-text-muted hover:text-text-base transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold border border-orange-500/20 text-lg">
                  {selectedBookingDetails.guest ? `${selectedBookingDetails.guest.firstName[0]}${selectedBookingDetails.guest.lastName[0]}` : '?'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-base">
                    {selectedBookingDetails.guest ? `${selectedBookingDetails.guest.firstName} ${selectedBookingDetails.guest.lastName}` : t('modal.unknownGuest')}
                  </h3>
                  {selectedBookingDetails.guest?.nationality && (
                    <span className="text-xs text-text-muted mt-0.5">{selectedBookingDetails.guest.nationality}</span>
                  )}
                </div>
              </div>

              <div className="bg-bg-base border border-border-subtle rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-text-muted" />
                  <span className="text-text-base">{selectedBookingDetails.guest?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-text-muted" />
                  <span className="text-text-base">{selectedBookingDetails.guest?.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-text-muted" />
                  <span className="text-text-base">{selectedBookingDetails.booking.numberOfGuests || 1} {t('room.guests')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                <div className="p-3 bg-bg-base border border-border-subtle rounded-xl">
                  <span className="block text-xs text-text-muted mb-1">{t('modal.checkIn')}</span>
                  {new Date(selectedBookingDetails.booking.checkInDate).toLocaleDateString()}
                </div>
                <div className="p-3 bg-bg-base border border-border-subtle rounded-xl">
                  <span className="block text-xs text-text-muted mb-1">{t('modal.checkOut')}</span>
                  {new Date(selectedBookingDetails.booking.checkOutDate).toLocaleDateString()}
                </div>
              </div>

              <div className="p-4 bg-bg-base border border-border-subtle rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-text-muted" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">{t('calendar.notes')}</span>
                </div>
                <p className="text-sm text-text-base">
                  {selectedBookingDetails.guest?.notes || <span className="italic opacity-50">{t('modal.noNotesProvided')}</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
