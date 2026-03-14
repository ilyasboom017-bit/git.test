import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="h-16 bg-bg-surface backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 -ml-2 text-text-muted hover:text-text-base rounded-lg hover:bg-bg-surface-hover transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-bg-base border border-border-strong rounded-full w-64 focus-within:border-orange-500/50 focus-within:ring-1 focus-within:ring-orange-500/50 transition-all">
          <Search className="w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search bookings, guests..." 
            className="bg-transparent border-none outline-none text-sm text-text-base placeholder:text-text-muted w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-text-muted hover:text-text-base rounded-full hover:bg-bg-surface-hover transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-bg-surface"></span>
        </button>
        
        <div className="h-8 w-px bg-border-strong mx-1"></div>
        
        <button 
          onClick={() => window.location.reload()}
          className="text-sm font-medium text-text-muted hover:text-text-base transition-colors"
        >
          Log out
        </button>
      </div>
    </header>
  );
};
