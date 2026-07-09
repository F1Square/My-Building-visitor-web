export const SITE_NAME = "MyBuilding";
export const SITE_TAGLINE = "Smart Society Management App";
export const SITE_DESCRIPTION =
  "Manage maintenance, visitors, complaints, announcements, and community operations for your residential society — one secure app for admins, residents, and security staff.";
export const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ||
  "https://mybuilding.app";
