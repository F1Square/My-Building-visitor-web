/** Official MyBuilding app store links (same as mobile UpdateModal). */
export const APP_LINKS = {
  playStore: 'https://play.google.com/store/apps/details?id=com.f1square.mybuilding',
  appStore: 'https://apps.apple.com/app/my-building',
} as const;

export type MobileFeature =
  | 'subscription'
  | 'maintenance-payment'
  | 'newspaper-addon'
  | 'visitor-qr'
  | 'push-notifications'
  | 'generic';

export const MOBILE_FEATURE_COPY: Record<MobileFeature, { title: string; message: string }> = {
  subscription: {
    title: 'Subscribe on mobile',
    message: 'Plan purchase, upgrades, and secure payment are available in the MyBuilding mobile app. Download the app to subscribe or upgrade your plan.',
  },
  'maintenance-payment': {
    title: 'Pay bills on mobile',
    message: 'Online maintenance payments are processed in the MyBuilding mobile app for a secure checkout experience. Download the app to pay your bills.',
  },
  'newspaper-addon': {
    title: 'Newspaper add-on on mobile',
    message: 'Purchase the newspaper add-on with in-app payment in the MyBuilding mobile app.',
  },
  'visitor-qr': {
    title: 'QR poster on mobile',
    message: 'Generate, download, and share visitor QR posters from the MyBuilding mobile app.',
  },
  'push-notifications': {
    title: 'Notifications on mobile',
    message: 'Real-time push notifications for visitors, bills, and announcements are available in the MyBuilding mobile app.',
  },
  generic: {
    title: 'Available on mobile',
    message: 'This action is best experienced in the MyBuilding mobile app. Download it to continue.',
  },
};
