export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  flat_no?: string;
  wing?: string;
  total_members?: number;
  role: 'user' | 'pramukh' | 'admin' | 'watchman';
  building_id: string | null;
  building_name?: string;
}

export interface Subscription {
  id: string;
  building_id: string;
  plan: string;
  status: 'active' | 'expired' | 'cancelled';
  start_date?: string;
  expires_at: string | null;
  newspaper_addon?: boolean;
  newspaper_expires_at?: string | null;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface UnreadCounts {
  [type: string]: number;
}

export interface Announcement {
  id: string;
  building_id: string;
  title: string;
  body: string;
  priority: 'normal' | 'urgent';
  users?: { name: string };
  created_at: string;
}

export interface Bill {
  id: string;
  flat_no: string;
  amount: number;
  due_date?: string;
  status: 'pending' | 'paid';
  category: 'maintenance' | 'water_meter' | 'special';
  description?: string;
  maintenance_bills?: { category: string };
}

export interface Visitor {
  id: string;
  building_id: string;
  name: string;
  phone: string;
  flat_no?: string;
  purpose?: string;
  work_detail?: string;
  photo_url?: string;
  created_at: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  vehicle_number: string;
  type: string;
  owner_name?: string;
}

export interface ChatMessage {
  id: string;
  building_id: string;
  user_id: string;
  sender_name?: string;
  users?: { name: string };
  message: string;
  created_at: string;
}

export interface Complaint {
  id: string;
  building_id: string;
  user_id: string;
  title: string;
  category: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  photo_url?: string;
  remark?: string;
  pramukh_remark?: string;
  users?: { name: string; flat_no?: string; wing?: string };
  created_at: string;
}

export interface Member {
  id: string;
  name: string;
  flat_no?: string;
  phone?: string;
  role: string;
  wing?: string;
}

export interface Expense {
  id: string;
  building_id: string;
  title: string;
  amount: number;
  category?: string;
  date?: string;
  description?: string;
  created_at: string;
}

export interface HelplineContact {
  id: string;
  building_id: string;
  name: string;
  phone: string;
  category?: string;
}

export interface NewspaperEdition {
  id: string;
  building_id?: string;
  date: string;
  language: string;
  source?: string;
  url?: string;
}

export interface SocietyRule {
  id: string;
  building_id: string;
  title: string;
  description?: string;
  category?: string;
  order_index?: number;
  created_at: string;
  updated_at?: string;
  updater?: { name?: string | null } | null;
}

export interface SubscriptionPlan {
  id: string;
  slug: string;
  title: string;
  description?: string;
  amount_paise: number;
  months: number | null;
  allow_newspaper_addon: boolean;
  newspaper_addon_paise?: number | null;
  sort_order: number;
  features?: string[];
}

export interface PromoValidation {
  valid: boolean;
  promo_id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  description?: string;
  original_amount: number;
  discount_amount: number;
  final_amount: number;
}

export interface JoinRequest {
  id: string;
  building_id: string;
  user_id: string;
  users?: { name: string; email: string };
  flat_no?: string;
  status: string;
  created_at: string;
}

export interface Building {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pramukh_name?: string;
  member_count?: number;
  subscription_status?: string;
  has_wings?: boolean;
  late_fees_enabled?: boolean;
  late_fees_amount?: number;
  water_reading_enabled?: boolean;
  payment_method?: string;
  society_logo?: string;
  payment_tc?: string;
  created_at?: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  user_name?: string;
  user_role?: string;
  action: string;
  module?: string;
  building_id?: string;
  detail?: Record<string, unknown> & { level?: string; error_message?: string; status_code?: number };
  ip_address?: string;
  created_at: string;
}

export interface Promo {
  id: string;
  code: string;
  discount_percent?: number;
  discount?: number;
  expiry_date?: string;
  expires_at?: string;
  usage_count?: number;
  max_uses?: number;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  status?: string;
  created_at: string;
}

export interface BankDetails {
  account_holder?: string;
  account_number?: string;
  ifsc_code?: string;
  bank_name?: string;
  upi_id?: string;
}
