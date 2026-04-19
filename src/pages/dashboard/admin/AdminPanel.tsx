import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Building2, Users, CreditCard, ListOrdered, Tag, MailOpen, Landmark } from 'lucide-react';

const SECTIONS = [
  { icon: Building2, label: 'Buildings', path: '/dashboard/admin/buildings', color: '#3B5FC0', bg: '#E8EEF9' },
  { icon: Users, label: 'Users', path: '/dashboard/admin/users', color: '#0D9488', bg: '#E0F7F4' },
  { icon: CreditCard, label: 'Subscriptions', path: '/dashboard/admin/subscriptions', color: '#CA8A04', bg: '#FEF9C3' },
  { icon: ListOrdered, label: 'Activity Logs', path: '/dashboard/admin/activity-logs', color: '#475569', bg: '#F1F5F9' },
  { icon: Tag, label: 'Promo Codes', path: '/dashboard/admin/promos', color: '#EF4444', bg: '#FDE8E8' },
  { icon: MailOpen, label: 'Inquiries', path: '/dashboard/admin/inquiries', color: '#0EA5E9', bg: '#E0F2FE' },
  { icon: Landmark, label: 'Bank Details', path: '/dashboard/admin/bank-details', color: '#7C3AED', bg: '#EDE9FE' },
];

export default function AdminPanel() {
  const navigate = useNavigate();
  return (
    <div>
      <PageHeader title="Admin Panel" subtitle="Platform management" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {SECTIONS.map(s => {
          const Icon = s.icon;
          return (
            <button key={s.path} onClick={() => navigate(s.path)}
              className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <Icon className="w-7 h-7" style={{ color: s.color }} />
              </div>
              <span className="text-sm font-semibold text-gray-700">{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
