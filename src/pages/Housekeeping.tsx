import React, { useState } from 'react';
import { Search, Filter, Sparkles, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Room } from '../types';

export const Housekeeping: React.FC = () => {
  const { rooms, t, updateRoom } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<Room['status'] | 'All'>('All');

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
      case 'Available': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'Occupied': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'Cleaning': return <Sparkles className="w-4 h-4 text-blue-500" />;
      case 'Maintenance': return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default: return null;
    }
  };

  const handleStatusChange = (room: Room, newStatus: Room['status']) => {
    updateRoom({ ...room, status: newStatus });
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          room.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || room.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Sort rooms: Cleaning and Maintenance first, then Occupied, then Available
  const sortedRooms = [...filteredRooms].sort((a, b) => {
    const order = { 'Cleaning': 1, 'Maintenance': 2, 'Occupied': 3, 'Available': 4 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-base">{t('nav.housekeeping')}</h1>
          <p className="text-text-muted mt-1">{t('housekeeping.subtitle')}</p>
        </div>
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
            <div className="flex items-center gap-2 bg-bg-base border border-border-strong rounded-xl px-3 py-1.5">
              <Filter className="w-4 h-4 text-text-muted" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-transparent text-sm text-text-base outline-none appearance-none pr-4"
              >
                <option value="All">{t('filter.allStatuses')}</option>
                <option value="Cleaning">{t('status.cleaning')}</option>
                <option value="Maintenance">{t('status.maintenance')}</option>
                <option value="Occupied">{t('status.occupied')}</option>
                <option value="Available">{t('status.available')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-muted">
            <thead className="text-xs text-text-muted uppercase bg-bg-base border-b border-border-subtle">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">{t('table.room')}</th>
                <th className="px-6 py-4 font-medium tracking-wider">{t('table.type')}</th>
                <th className="px-6 py-4 font-medium tracking-wider">{t('table.status')}</th>
                <th className="px-6 py-4 font-medium tracking-wider text-right">{t('table.updateStatus')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {sortedRooms.map((room) => (
                <tr key={room.id} className="hover:bg-bg-surface-hover transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-bg-surface-hover flex items-center justify-center border border-border-strong">
                        {getStatusIcon(room.status)}
                      </div>
                      <span className="font-mono font-bold text-text-base text-base">{room.number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-text-base">{room.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(room.status)}`}>
                      {room.status === 'Available' ? t('status.available') : room.status === 'Occupied' ? t('status.occupied') : room.status === 'Cleaning' ? t('status.cleaning') : t('status.maintenance')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {room.status !== 'Available' && (
                        <button 
                          onClick={() => handleStatusChange(room, 'Available')}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-lg text-xs font-medium transition-colors"
                        >
                          {t('housekeeping.markAvailable')}
                        </button>
                      )}
                      {room.status !== 'Cleaning' && (
                        <button 
                          onClick={() => handleStatusChange(room, 'Cleaning')}
                          className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 rounded-lg text-xs font-medium transition-colors"
                        >
                          {t('housekeeping.markCleaning')}
                        </button>
                      )}
                      {room.status !== 'Maintenance' && (
                        <button 
                          onClick={() => handleStatusChange(room, 'Maintenance')}
                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-lg text-xs font-medium transition-colors"
                        >
                          {t('housekeeping.markMaintenance')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
