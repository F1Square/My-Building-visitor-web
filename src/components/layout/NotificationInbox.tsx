import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Badge } from '../ui/badge';
import { EmptyState } from '../ui/EmptyState';
import { Bell } from 'lucide-react';
import api from '../../lib/apiClient';
import type { AppNotification } from '../../types';

interface NotificationInboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationInbox({ open, onOpenChange }: NotificationInboxProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!open) return;
    api.get<AppNotification[]>('/notifications').then(setNotifications).catch(() => setNotifications([]));
    api.patch('/notifications/read-all').catch(() => {});
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          {notifications.length === 0 ? (
            <EmptyState icon={<Bell className="w-10 h-10 text-gray-300" />} title="No notifications" />
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`p-3 rounded-xl border ${n.is_read ? 'bg-white' : 'bg-blue-50 border-blue-100'}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm text-gray-900">{n.title}</p>
                  <Badge variant="secondary" className="text-xs shrink-0">{n.type?.replace(/_/g, ' ')}</Badge>
                </div>
                {n.body && <p className="text-sm text-gray-600 mt-1">{n.body}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
