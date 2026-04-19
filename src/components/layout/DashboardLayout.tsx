import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { NotificationInbox } from './NotificationInbox';

export function DashboardLayout() {
  const [inboxOpen, setInboxOpen] = useState(false);
  const [unreadCount] = useState(0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Outlet context={{ openInbox: () => setInboxOpen(true) }} />
        </div>
      </main>
      <BottomNav onBellClick={() => setInboxOpen(true)} unreadCount={unreadCount} />
      <NotificationInbox open={inboxOpen} onOpenChange={setInboxOpen} />
    </div>
  );
}
