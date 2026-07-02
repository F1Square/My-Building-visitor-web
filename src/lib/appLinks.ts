/** MyBuilding Android app — Google Play only (iOS coming later). */
export const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.f1square.mybuilding';

export type MobileFeature =
  | 'subscription'
  | 'maintenance-payment'
  | 'newspaper-addon'
  | 'visitor-qr'
  | 'push-notifications'
  | 'generic';

export const MOBILE_FEATURE_COPY: Record<MobileFeature, { title: string; message: string }> = {
  subscription: {
    title: 'Subscribe in the app',
    message: 'Pick your plan and pay securely in the MyBuilding Android app — takes under a minute.',
  },
  'maintenance-payment': {
    title: 'Pay bills in the app',
    message: 'Online maintenance payments open in the MyBuilding app with a quick, secure checkout.',
  },
  'newspaper-addon': {
    title: 'Add newspaper in the app',
    message: 'Unlock daily newspapers with a one-tap add-on purchase inside the MyBuilding app.',
  },
  'visitor-qr': {
    title: 'QR posters in the app',
    message: 'Download and print visitor QR posters for your gate — available in the MyBuilding app.',
  },
  'push-notifications': {
    title: 'Instant alerts in the app',
    message: 'Get real-time notifications for visitors, bills, and announcements on Android.',
  },
  generic: {
    title: 'Continue in the app',
    message: 'This feature works best in the MyBuilding Android app. Download it free on Google Play.',
  },
};

/** Avoid "Monthly Plan Plan" when API title already ends with Plan. */
export function formatPlanHeading(title: string): string {
  const t = title.trim();
  if (/\bplan$/i.test(t)) return t;
  return `${t} Plan`;
}

export const PLAN_ENGAGEMENT: Record<string, { tagline: string; description: string }> = {
  monthly: {
    tagline: 'Pay month to month',
    description: '₹15 per month — full access to every module, no long-term lock-in.',
  },
  yearly: {
    tagline: 'One bill for the whole year',
    description: '₹180 for 12 months — same full access, paid once a year instead of every month.',
  },
  lifetime: {
    tagline: 'Pay once, use forever',
    description: '₹1,500 one-time — unlimited access with no renewal dates to worry about.',
  },
};

/** Clear, standalone bullet points for the landing pricing cards (not tied to other plans). */
export const PLAN_DISPLAY_FEATURES: Record<string, string[]> = {
  monthly: [
    'Billed every month at ₹15',
    'All modules unlocked',
    'Maintenance, visitors, chat & announcements',
    'Cancel anytime — no yearly contract',
  ],
  yearly: [
    'Billed once a year at ₹180',
    'Covers 12 full months of access',
    'All modules unlocked',
    'One payment — no monthly billing',
  ],
  lifetime: [
    'Single payment of ₹1,500',
    'All modules unlocked — forever',
    'No expiry date, no renewals',
    'Includes all future app updates',
  ],
};
