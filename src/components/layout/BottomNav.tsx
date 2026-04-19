import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Bell, User, Grid3X3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  onBellClick: () => void;
  unreadCount?: number;
}

export function BottomNav({ onBellClick, unreadCount = 0 }: BottomNavProps) {
  const location = useLocation();
  const { user } = useAuth();

  const items = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Bell, label: 'Alerts', path: null, onClick: onBellClick, badge: unreadCount },
    { icon: User, label: 'Profile', path: '/dashboard/profile' },
    { icon: Grid3X3, label: 'More', path: user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/society-rules' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 flex">
      {items.map(item => {
        const active = item.path ? location.pathname === item.path : false;
        const Icon = item.icon;
        const content = (
          <div className={`flex flex-col items-center gap-1 py-2 px-1 relative ${active ? 'text-blue-600' : 'text-gray-500'}`}>
            <div className="relative">
              <Icon className="w-5 h-5" />
              {(item.badge ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {(item.badge ?? 0) > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </div>
        );

        if (item.onClick) {
          return (
            <button key={item.label} onClick={item.onClick} className="flex-1 flex justify-center">
              {content}
            </button>
          );
        }
        return (
          <Link key={item.label} to={item.path!} className="flex-1 flex justify-center">
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
