import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  BedDouble, 
  Users, 
  Calendar as CalendarIcon, 
  Sparkles, 
  BarChart3, 
  Settings,
  X,
  Hotel
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { TranslationKey } from '../i18n/translations';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems: { nameKey: TranslationKey; icon: any; path: string }[] = [
  { nameKey: 'nav.dashboard', icon: LayoutDashboard, path: '/' },
  { nameKey: 'nav.bookings', icon: CalendarDays, path: '/bookings' },
  { nameKey: 'nav.rooms', icon: BedDouble, path: '/rooms' },
  { nameKey: 'nav.customers', icon: Users, path: '/customers' },
  { nameKey: 'nav.calendar', icon: CalendarIcon, path: '/calendar' },
  { nameKey: 'nav.housekeeping', icon: Sparkles, path: '/housekeeping' },
  { nameKey: 'nav.reports', icon: BarChart3, path: '/reports' },
  { nameKey: 'nav.settings', icon: Settings, path: '/settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const currentPath = window.location.pathname;
  const { t } = useAppContext();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-bg-surface backdrop-blur-xl border-r border-border-subtle
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border-subtle">
          <div className="flex items-center gap-3 text-orange-500">
            <Hotel className="w-6 h-6" />
            <span className="text-xl font-semibold text-text-base tracking-tight">{t('app.title')}</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-text-muted hover:text-text-base">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || (currentPath === '' && item.path === '/');
            return (
              <a
                key={item.nameKey}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', item.path);
                  window.dispatchEvent(new Event('popstate'));
                  setIsOpen(false);
                }}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-orange-500/10 text-orange-500' 
                    : 'text-text-muted hover:text-text-base hover:bg-bg-surface-hover'}
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-text-muted group-hover:text-text-base'}`} />
                <span className="font-medium text-sm">{t(item.nameKey)}</span>
              </a>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border-subtle">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-bg-surface-hover border border-border-subtle">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-semibold text-sm">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-base truncate">Admin User</p>
              <p className="text-xs text-text-muted truncate">admin@gite-tarist.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
