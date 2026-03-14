import React, { useState } from 'react';
import { Search, Filter, Mail, Phone, Edit2, Trash2, Plus, X, Save, FileText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Guest } from '../types';
import { DatePicker } from '../components/DatePicker';
import { NationalitySelect } from '../components/NationalitySelect';

export const Customers: React.FC = () => {
  const { guests, bookings, t, addGuest, updateGuest, deleteGuest } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  
  const [showFilters, setShowFilters] = useState(false);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterNationality, setFilterNationality] = useState('');
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
    notes: ''
  });

  const handleOpenModal = (guest?: Guest) => {
    if (guest) {
      setFormData({
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone,
        nationality: guest.nationality || '',
        notes: guest.notes || ''
      });
      setEditingGuest(guest);
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        nationality: '',
        notes: ''
      });
      setEditingGuest(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    const newGuest: Guest = {
      id: editingGuest ? editingGuest.id : `g${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      nationality: formData.nationality,
      notes: formData.notes,
      totalStays: editingGuest ? editingGuest.totalStays : 0
    };

    if (editingGuest) {
      updateGuest(newGuest);
    } else {
      addGuest(newGuest);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('modal.deleteConfirm'))) {
      deleteGuest(id);
    }
  };

  const handleSaveNote = (guest: Guest) => {
    updateGuest({ ...guest, notes: notesDraft });
    setEditingNoteId(null);
  };

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          guest.phone.includes(searchTerm);

    const matchesNationality = filterNationality ? guest.nationality?.toLowerCase().includes(filterNationality.toLowerCase()) : true;

    let matchesPaymentStatus = true;
    let matchesPaymentMethod = true;
    let matchesDate = true;

    if (filterPaymentStatus || filterPaymentMethod || filterDate) {
      const guestBookings = bookings.filter(b => b.guestId === guest.id);
      
      if (filterPaymentStatus) {
        matchesPaymentStatus = guestBookings.some(b => b.paymentStatus === filterPaymentStatus);
      }
      if (filterPaymentMethod) {
        matchesPaymentMethod = guestBookings.some(b => b.paymentMethod === filterPaymentMethod);
      }
      if (filterDate) {
        matchesDate = guestBookings.some(b => b.checkInDate.startsWith(filterDate));
      }
    }

    return matchesSearch && matchesNationality && matchesPaymentStatus && matchesPaymentMethod && matchesDate;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-base">{t('customers.title')}</h1>
          <p className="text-text-muted mt-1">{t('customers.subtitle')}</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          {t('btn.addCustomer')}
        </button>
      </div>

      <div className="bg-bg-surface backdrop-blur-xl border border-border-subtle rounded-2xl overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row gap-4 justify-between items-center bg-bg-surface-hover">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder={t('customers.search')} 
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

        {/* Extended Filters */}
        {showFilters && (
          <div className="p-4 border-b border-border-subtle bg-bg-base grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">{t('filter.nationality')}</label>
              <NationalitySelect 
                value={filterNationality}
                onChange={(nat) => setFilterNationality(nat)}
                placeholder={t('filter.anyNationality')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">{t('filter.paymentStatus')}</label>
              <select 
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value)}
                className="w-full bg-bg-surface border border-border-strong rounded-xl px-3 py-2 text-sm text-text-base focus:border-orange-500/50 outline-none appearance-none"
              >
                <option value="">{t('filter.allStatuses')}</option>
                <option value="Paid">{t('payment.paid')}</option>
                <option value="Pending">{t('payment.pending')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">{t('filter.paymentMethod')}</label>
              <select 
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                className="w-full bg-bg-surface border border-border-strong rounded-xl px-3 py-2 text-sm text-text-base focus:border-orange-500/50 outline-none appearance-none"
              >
                <option value="">{t('filter.allMethods')}</option>
                <option value="Cash">{t('payment.cash')}</option>
                <option value="Remote">{t('payment.remote')}</option>
              </select>
            </div>
            <div>
              <DatePicker 
                label={t('filter.arrivalDate')}
                value={filterDate}
                onChange={(date) => setFilterDate(date)}
                bookings={[]}
              />
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-muted">
            <thead className="text-xs text-text-muted uppercase bg-bg-base border-b border-border-subtle">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">{t('table.name')}</th>
                <th className="px-6 py-4 font-medium tracking-wider">{t('table.contact')}</th>
                <th className="px-6 py-4 font-medium tracking-wider">{t('table.nationality')}</th>
                <th className="px-6 py-4 font-medium tracking-wider">{t('table.totalStays')}</th>
                <th className="px-6 py-4 font-medium tracking-wider">{t('table.notes')}</th>
                <th className="px-6 py-4 font-medium tracking-wider text-right">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-bg-surface-hover transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold border border-orange-500/20">
                        {guest.firstName[0]}{guest.lastName[0]}
                      </div>
                      <span className="font-medium text-text-base">{guest.firstName} {guest.lastName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Mail className="w-3 h-3 text-text-muted" />
                        <span className="text-text-base">{guest.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Phone className="w-3 h-3 text-text-muted" />
                        <span className="text-text-muted">{guest.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-text-base">{guest.nationality || '-'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-bg-surface-hover text-text-base font-medium">
                      {guest.totalStays}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {editingNoteId === guest.id ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          autoFocus
                          rows={3}
                          value={notesDraft}
                          onChange={e => setNotesDraft(e.target.value)}
                          className="w-full min-w-[220px] bg-bg-base border border-orange-500/40 rounded-xl px-3 py-2 text-sm text-text-base focus:border-orange-500/70 focus:ring-1 focus:ring-orange-500/30 outline-none transition-all resize-none"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveNote(guest)}
                            className="flex items-center gap-1 px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white text-[11px] rounded-lg transition-colors"
                          >
                            <Save className="w-3 h-3" /> {t('btn.save')}
                          </button>
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="flex items-center gap-1 px-2 py-1 bg-bg-surface-hover hover:bg-bg-surface border border-border-strong text-text-muted text-[11px] rounded-lg transition-colors"
                          >
                            <X className="w-3 h-3" /> {t('btn.cancel')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingNoteId(guest.id); setNotesDraft(guest.notes || ''); }}
                        className="group/note flex items-start gap-2 text-left w-full max-w-[220px] hover:text-text-base transition-colors"
                        title={t('btn.edit')}
                      >
                        <FileText className="w-3.5 h-3.5 text-text-muted mt-0.5 flex-shrink-0 group-hover/note:text-orange-500 transition-colors" />
                        <span className="text-xs text-text-muted truncate">
                          {guest.notes || <span className="italic opacity-50">{t('modal.noNotes')}</span>}
                        </span>
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(guest)} className="p-1.5 text-text-muted hover:text-text-base hover:bg-bg-surface-hover rounded-lg transition-colors" title={t('btn.edit')}>
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(guest.id)} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors" title={t('btn.delete')}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New/Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-bg-surface border border-border-subtle rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border-subtle">
              <h2 className="text-lg font-semibold text-text-base">
                {editingGuest ? t('modal.editCustomer') : t('modal.newCustomer')}
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
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted">{t('modal.nationality')}</label>
                <NationalitySelect 
                  value={formData.nationality}
                  onChange={nat => setFormData({...formData, nationality: nat})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted">{t('modal.notes')}</label>
                <textarea 
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full bg-bg-base border border-border-strong rounded-xl px-3 py-2 text-sm text-text-base focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all resize-none" 
                />
              </div>
            </div>
            <div className="p-6 border-t border-border-subtle flex justify-end gap-3 bg-bg-surface-hover">
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
    </div>
  );
};
