export interface ModuleConfig {
  key: string;
  label: string;
  icon: string; // lucide icon name
  path: string;
  color: string;
  bg: string;
}

export const MODULE_VISIBILITY: Record<string, string[]> = {
  user: [
    'details','members','expenses','maintenance','announcements',
    'visitors','parking','chat','complaints','helpline',
    'subscription','refer','newspaper','society-rules',
  ],
  pramukh: [
    'details','members','expenses','maintenance','announcements',
    'visitors','parking','chat','complaints','helpline',
    'subscription','refer','newspaper','society-rules','join-requests',
  ],
  admin: [
    'expenses','maintenance','announcements','visitors','bank-details',
    'admin','users','inquiries','complaints','helpline',
    'subscriptions-admin','promos','activity-logs','refer','newspaper','society-rules',
  ],
  watchman: ['visitors','helpline'],
};

export const SUBSCRIPTION_GATED_MODULES = ['complaints', 'chat', 'newspaper', 'refer', 'society-rules'];

export const ALL_MODULES: ModuleConfig[] = [
  { key: 'details',           label: 'My Details',       icon: 'User',           path: '/dashboard/profile',              color: '#3B5FC0', bg: '#E8EEF9' },
  { key: 'members',           label: 'Members',          icon: 'Users',          path: '/dashboard/members',              color: '#F59E0B', bg: '#FFF3E0' },
  { key: 'expenses',          label: 'Expenses',         icon: 'Wallet',         path: '/dashboard/expenses',             color: '#7C3AED', bg: '#EDE9FE' },
  { key: 'maintenance',       label: 'Maintenance',      icon: 'Wrench',         path: '/dashboard/maintenance',          color: '#F59E0B', bg: '#FFF3E0' },
  { key: 'announcements',     label: 'Announcements',    icon: 'Megaphone',      path: '/dashboard/announcements',        color: '#0EA5E9', bg: '#E0F2FE' },
  { key: 'visitors',          label: 'Visitors',         icon: 'Eye',            path: '/dashboard/visitors',             color: '#7C3AED', bg: '#EDE9FE' },
  { key: 'parking',           label: 'Parking',          icon: 'Car',            path: '/dashboard/parking',              color: '#0D9488', bg: '#E0F7F4' },
  { key: 'chat',              label: 'Group Chat',       icon: 'MessageCircle',  path: '/dashboard/chat',                 color: '#EF4444', bg: '#FEE2E2' },
  { key: 'complaints',        label: 'Complaints',       icon: 'AlertCircle',    path: '/dashboard/complaints',           color: '#EF4444', bg: '#FDE8E8' },
  { key: 'helpline',          label: 'Helpline',         icon: 'Phone',          path: '/dashboard/helpline',             color: '#0EA5E9', bg: '#E0F2FE' },
  { key: 'subscription',      label: 'Subscription',     icon: 'CreditCard',     path: '/dashboard/subscribe',            color: '#CA8A04', bg: '#FEF9C3' },
  { key: 'refer',             label: 'Refer & Earn',     icon: 'Gift',           path: '/dashboard/refer',                color: '#EC4899', bg: '#FFF0F5' },
  { key: 'newspaper',         label: 'Newspaper',        icon: 'Newspaper',      path: '/dashboard/newspaper',            color: '#EA580C', bg: '#FFF7ED' },
  { key: 'society-rules',     label: 'Society Rules',    icon: 'BookOpen',       path: '/dashboard/society-rules',        color: '#16A34A', bg: '#F0FDF4' },
  { key: 'join-requests',     label: 'Join Requests',    icon: 'UserPlus',       path: '/dashboard/join-requests',        color: '#16A34A', bg: '#DCFCE7' },
  { key: 'bank-details',      label: 'Bank Details',     icon: 'Building2',      path: '/dashboard/admin/bank-details',   color: '#7C3AED', bg: '#EDE9FE' },
  { key: 'admin',             label: 'Admin Panel',      icon: 'ShieldCheck',    path: '/dashboard/admin',                color: '#3B5FC0', bg: '#E8EEF9' },
  { key: 'users',             label: 'Users',            icon: 'Users2',         path: '/dashboard/admin/users',          color: '#0D9488', bg: '#E0F7F4' },
  { key: 'inquiries',         label: 'Inquiries',        icon: 'MailOpen',       path: '/dashboard/admin/inquiries',      color: '#0EA5E9', bg: '#E0F2FE' },
  { key: 'subscriptions-admin', label: 'Subscriptions', icon: 'CreditCard',     path: '/dashboard/admin/subscriptions',  color: '#CA8A04', bg: '#FEF9C3' },
  { key: 'promos',            label: 'Promo Codes',      icon: 'Tag',            path: '/dashboard/admin/promos',         color: '#EF4444', bg: '#FDE8E8' },
  { key: 'activity-logs',     label: 'Activity Logs',    icon: 'ListOrdered',    path: '/dashboard/admin/activity-logs',  color: '#475569', bg: '#F1F5F9' },
];

export function getGreeting(hour: number): string {
  if (hour >= 5 && hour <= 11) return 'Good morning';
  if (hour >= 12 && hour <= 16) return 'Good afternoon';
  return 'Good evening';
}

export function filterModules(modules: ModuleConfig[], query: string): ModuleConfig[] {
  if (!query.trim()) return modules;
  const q = query.toLowerCase();
  return modules.filter(m => m.label.toLowerCase().includes(q));
}
