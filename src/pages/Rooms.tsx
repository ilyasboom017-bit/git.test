import React, { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, BedDouble, Settings2, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Room } from '../types';

export const Rooms: React.FC = () => {
  const { rooms, t, addRoom, updateRoom, deleteRoom } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    number: '',
    type: 'Standard',
    capacity: 2,
    pricePerNight: 100,
    status: 'Available' as Room['status']
  });

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Occupied': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Cleaning': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Maintenance': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20';
    }
  };

  const handleOpenModal = (room?: Room) => {
    if (room) {
      setFormData({
        number: room.number,
        type: room.type,
        capacity: room.capacity,
        pricePerNight: room.pricePerNight,
        status: room.status
      });
      setEditingRoom(room);
    } else {
      setFormData({
        number: '',
        type: 'Standard',
        capacity: 2,
        pricePerNight: 100,
        status: 'Available'
      });
      setEditingRoom(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    const newRoom: Room = {
      id: editingRoom ? editingRoom.id : `r${Date.now()}`,
      number: formData.number,
      type: formData.type as any,
      capacity: Number(formData.capacity),
      pricePerNight: Number(formData.pricePerNight),
      status: formData.status as any,
      amenities: editingRoom ? editingRoom.amenities : ['Wi-Fi', 'TV', 'Air Conditioning']
    };

    if (editingRoom) {
      updateRoom(newRoom);
    } else {
      addRoom(newRoom);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('modal.deleteConfirm'))) {
      deleteRoom(id);
    }
  };

  const filteredRooms = rooms.filter(room => 
    room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-base">{t('rooms.title')}</h1>
          <p className="text-text-muted mt-1">{t('rooms.subtitle')}</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          {t('btn.addRoom')}
        </button>
      </div>

      <div className="bg-bg-surface backdrop-blur-xl border border-border-subtle rounded-2xl overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row gap-4 justify-between items-center bg-bg-surface-hover">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder={t('rooms.search')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-bg-base border border-border-strong rounded-xl pl-10 pr-4 py-2 text-sm text-text-base placeholder:text-text-muted focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-bg-base border border-border-strong rounded-xl text-sm font-medium text-text-base hover:bg-bg-surface-hover transition-colors">
              <Filter className="w-4 h-4" />
              {t('bookings.filter')}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-muted">
            <thead className="text-xs text-text-muted uppercase bg-bg-base border-b border-border-subtle">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">{t('table.room')}</th>
                <th className="px-6 py-4 font-medium tracking-wider">{t('table.type')}</th>
                <th className="px-6 py-4 font-medium tracking-wider">{t('table.capacity')}</th>
                <th className="px-6 py-4 font-medium tracking-wider">{t('table.price')}</th>
                <th className="px-6 py-4 font-medium tracking-wider">{t('table.status')}</th>
                <th className="px-6 py-4 font-medium tracking-wider text-right">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredRooms.map((room) => (
                <tr key={room.id} className="hover:bg-bg-surface-hover transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-bg-surface-hover flex items-center justify-center border border-border-strong">
                        <BedDouble className="w-4 h-4 text-text-muted" />
                      </div>
                      <span className="font-mono font-bold text-text-base text-base">{room.number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-text-base">{room.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-text-muted">{room.capacity} {t('room.guests')}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-text-base font-medium">${room.pricePerNight}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(room.status)}`}>
                      {room.status === 'Available' ? t('status.available') : room.status === 'Occupied' ? t('status.occupied') : room.status === 'Cleaning' ? t('status.cleaning') : t('status.maintenance')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(room)}
                        className="p-1.5 text-text-muted hover:text-text-base hover:bg-bg-surface-hover rounded-lg transition-colors" 
                        title="Settings"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleOpenModal(room)} className="p-1.5 text-text-muted hover:text-text-base hover:bg-bg-surface-hover rounded-lg transition-colors" title={t('btn.edit')}>
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(room.id)} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors" title={t('btn.delete')}>
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

      {/* New/Edit Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-bg-surface border border-border-subtle rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border-subtle">
              <h2 className="text-lg font-semibold text-text-base">
                {editingRoom ? t('modal.editRoom') : t('modal.newRoom')}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-base transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted">{t('modal.roomNumber')}</label>
                <input 
                  type="text" 
                  value={formData.number}
                  onChange={e => setFormData({...formData, number: e.target.value})}
                  className="w-full bg-bg-base border border-border-strong rounded-xl px-3 py-2 text-sm text-text-base focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">{t('modal.roomType')}</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-bg-base border border-border-strong rounded-xl px-3 py-2 text-sm text-text-base focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all appearance-none"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Family">Family</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">{t('modal.capacity')}</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.capacity}
                    onChange={e => setFormData({...formData, capacity: Number(e.target.value)})}
                    className="w-full bg-bg-base border border-border-strong rounded-xl px-3 py-2 text-sm text-text-base focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">{t('modal.price')}</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.pricePerNight}
                    onChange={e => setFormData({...formData, pricePerNight: Number(e.target.value)})}
                    className="w-full bg-bg-base border border-border-strong rounded-xl px-3 py-2 text-sm text-text-base focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">{t('modal.status')}</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as Room['status']})}
                    className="w-full bg-bg-base border border-border-strong rounded-xl px-3 py-2 text-sm text-text-base focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all appearance-none"
                  >
                    <option value="Available">{t('status.available')}</option>
                    <option value="Occupied">{t('status.occupied')}</option>
                    <option value="Cleaning">{t('status.cleaning')}</option>
                    <option value="Maintenance">{t('status.maintenance')}</option>
                  </select>
                </div>
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
