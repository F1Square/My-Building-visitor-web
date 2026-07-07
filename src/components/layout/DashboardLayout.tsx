import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { NotificationInbox } from './NotificationInbox';
import { useAuth } from '../../context/AuthContext';
import { Bell, HelpCircle } from 'lucide-react';
import { Button } from '../ui/button';

export function DashboardLayout() {
  const [inboxOpen, setInboxOpen] = useState(false);
  const [unreadCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const showHelp = user?.role === 'user' || user?.role === 'pramukh';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto pb-20 md:pb-0 w-full min-w-0">
        <div className="w-full max-w-5xl mx-auto px-5 sm:px-6 py-6 box-border">
          <div className="hidden md:flex justify-end items-center gap-2 mb-4">
            {showHelp && (
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10"
                onClick={() => navigate('/dashboard/support')}
                aria-label="Help and Support"
              >
                <HelpCircle className="w-5 h-5" />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10 relative"
              onClick={() => setInboxOpen(true)}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </div>
          <Outlet context={{ openInbox: () => setInboxOpen(true) }} />
        </div>
      </main>
      <BottomNav onBellClick={() => setInboxOpen(true)} unreadCount={unreadCount} />
      <NotificationInbox open={inboxOpen} onOpenChange={setInboxOpen} />
    </div>
  );
}
