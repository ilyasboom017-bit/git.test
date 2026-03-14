import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Download, Moon, Sun, Globe, Lock } from 'lucide-react';

export const Settings: React.FC = () => {
  const [currentCode, setCurrentCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [isUpdatingCode, setIsUpdatingCode] = useState(false);
  const { t, theme, setTheme, language, setLanguage, bookings, guests, rooms, showNotification } = useAppContext();

  const handleExport = () => {
    // Generate CSV
    const headers = ['Guest Name', 'Phone Number', 'Room Number', 'Check-in Date', 'Check-out Date', 'Number of Nights', 'Booking Status'];
    
    const rows = bookings.map(booking => {
      const guest = guests.find(g => g.id === booking.guestId);
      const room = rooms.find(r => r.id === booking.roomId);
      
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
      
      return [
        `"${guest?.firstName} ${guest?.lastName}"`,
        `"${guest?.phone}"`,
        `"${room?.number}"`,
        `"${checkIn.toLocaleDateString()}"`,
        `"${checkOut.toLocaleDateString()}"`,
        nights,
        `"${booking.status}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingCode(true);
    try {
      const res = await fetch('/api/settings/update-code', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentCode, newCode }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(t('notify.codeUpdated'));
        setCurrentCode('');
        setNewCode('');
      } else {
        showNotification(data.error || 'Failed to update code', 'error');
      }
    } catch (err) {
      showNotification('Connection error', 'error');
    } finally {
      setIsUpdatingCode(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-base">{t('settings.title')}</h1>
        <p className="text-text-muted mt-1">{t('settings.subtitle')}</p>
      </div>

      <div className="grid gap-6 max-w-3xl">
        {/* Language Settings */}
        <div className="bg-bg-surface backdrop-blur-xl border border-border-subtle rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-lg font-semibold text-text-base">{t('settings.language')}</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(['en', 'fr', 'ar'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  language === lang 
                    ? 'border-orange-500 bg-orange-500/10 text-orange-500' 
                    : 'border-border-strong text-text-muted hover:bg-bg-surface-hover'
                }`}
              >
                {lang === 'en' ? 'English' : lang === 'fr' ? 'Français' : 'العربية'}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-bg-surface backdrop-blur-xl border border-border-subtle rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-blue-500" /> : <Sun className="w-5 h-5 text-blue-500" />}
            </div>
            <h2 className="text-lg font-semibold text-text-base">{t('settings.theme')}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                theme === 'light' 
                  ? 'border-blue-500 bg-blue-500/10 text-blue-500' 
                  : 'border-border-strong text-text-muted hover:bg-bg-surface-hover'
              }`}
            >
              <Sun className="w-4 h-4" />
              {t('theme.light')}
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                theme === 'dark' 
                  ? 'border-blue-500 bg-blue-500/10 text-blue-500' 
                  : 'border-border-strong text-text-muted hover:bg-bg-surface-hover'
              }`}
            >
              <Moon className="w-4 h-4" />
              {t('theme.dark')}
            </button>
          </div>
        </div>

        {/* Data Export */}
        <div className="bg-bg-surface backdrop-blur-xl border border-border-subtle rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Download className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-base">{t('settings.export')}</h2>
              <p className="text-sm text-text-muted">{t('settings.exportDesc')}</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {t('btn.exportExcel')}
          </button>
        </div>

        {/* Security Settings */}
        <div className="bg-bg-surface backdrop-blur-xl border border-border-subtle rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-base">{t('settings.security')}</h2>
              <p className="text-sm text-text-muted">{t('settings.securityDesc')}</p>
            </div>
          </div>
          <form onSubmit={handleUpdateCode} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">{t('settings.currentCode')}</label>
                <input
                  type="password"
                  value={currentCode}
                  onChange={(e) => setCurrentCode(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-base border border-border-subtle rounded-xl text-text-base text-center tracking-widest focus:outline-none focus:border-red-500 transition-all font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">{t('settings.newCode')}</label>
                <input
                  type="password"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-base border border-border-subtle rounded-xl text-text-base text-center tracking-widest focus:outline-none focus:border-red-500 transition-all font-mono"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isUpdatingCode}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium shadow-lg shadow-red-500/20 transition-all"
            >
              {isUpdatingCode ? t('settings.updating') : t('settings.updateCode')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
