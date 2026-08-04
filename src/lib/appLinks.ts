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
    message: 'Pick your plan and pay securely in the MyBuilding Android app - takes under a minute.',
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
    message: 'Download and print visitor QR posters for your gate - available in the MyBuilding app.',
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

/** List (struck-through) vs sale prices for classic plans. */
export const PLAN_LIST_RUPEES: Record<string, number> = { monthly: 15, yearly: 180 };
export const PLAN_SALE_RUPEES: Record<string, number> = { monthly: 10, yearly: 120 };

export function getPlanDisplayPrices(slug: string, amountPaise: number) {
  const sale = PLAN_SALE_RUPEES[slug];
  const list = PLAN_LIST_RUPEES[slug];
  const amountRupees = sale ?? Math.round(amountPaise / 100);
  const compareAtRupees =
    list != null && list > amountRupees ? list : null;
  return { amountRupees, compareAtRupees };
}
