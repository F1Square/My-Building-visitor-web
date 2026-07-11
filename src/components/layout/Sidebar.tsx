import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getModulesForRole } from '../../lib/modules';
import { LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { BrandLogo } from '../BrandLogo';

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const role = user?.role ?? 'user';
  const navModules = getModulesForRole(role);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <BrandLogo size="md" wordmarkClassName="text-lg font-bold text-gray-900" />
      </div>

      {/* Building name */}
      {user?.building_name && (
        <div className="px-6 py-2 text-xs text-gray-500 font-medium truncate">{user.building_name}</div>
      )}

      {/* Nav links */}
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="space-y-1">
          {navModules.map(m => {
            const active = location.pathname === m.path || location.pathname.startsWith(m.path + '/');
            return (
              <Link
                key={m.key}
                to={m.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-base">{m.label}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User + logout */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>
    </aside>
  );
}
