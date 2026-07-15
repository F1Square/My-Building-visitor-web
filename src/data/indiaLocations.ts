/** All Indian states/UTs with major cities for society registration. */
export const INDIA_STATES_CITIES: Record<string, string[]> = {
  "Andaman and Nicobar Islands": ["Port Blair", "Havelock Island", "Diglipur"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Rajahmundry", "Kakinada"],
  "Arunachal Pradesh": ["Itanagar", "Tawang", "Pasighat", "Naharlagun"],
  Assam: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur", "Nagaon"],
  Bihar: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga"],
  Chandigarh: ["Chandigarh"],
  Chhattisgarh: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  Delhi: ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi"],
  Goa: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Gandhinagar", "Jamnagar", "Junagadh", "Anand", "Mehsana"],
  Haryana: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Hisar", "Karnal", "Rohtak", "Sonipat"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Kullu", "Manali"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur"],
  Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar"],
  Karnataka: ["Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belagavi", "Mangalore", "Davangere", "Ballari"],
  Kerala: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Kannur"],
  Ladakh: ["Leh", "Kargil"],
  Lakshadweep: ["Kavaratti", "Agatti", "Minicoy"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Navi Mumbai", "Kolhapur", "Solapur", "Amravati"],
  Manipur: ["Imphal", "Thoubal", "Churachandpur"],
  Meghalaya: ["Shillong", "Tura", "Jowai"],
  Mizoram: ["Aizawl", "Lunglei", "Champhai"],
  Nagaland: ["Kohima", "Dimapur", "Mokokchung"],
  Odisha: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri"],
  Puducherry: ["Puducherry", "Karaikal", "Mahe", "Yanam"],
  Punjab: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Mohali", "Bathinda"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar"],
  Sikkim: ["Gangtok", "Namchi", "Gyalshing"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
  Tripura: ["Agartala", "Udaipur", "Dharmanagar"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Noida", "Ghaziabad", "Prayagraj", "Bareilly"],
  Uttarakhand: ["Dehradun", "Haridwar", "Rishikesh", "Nainital", "Haldwani", "Roorkee"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Kharagpur"],
};

export const INDIA_STATES = Object.keys(INDIA_STATES_CITIES).sort((a, b) => a.localeCompare(b));

export function getCitiesForState(state: string): string[] {
  return INDIA_STATES_CITIES[state] ?? [];
}

export function isValidStateCity(state: string, city: string): boolean {
  const cities = INDIA_STATES_CITIES[state];
  if (!cities) return false;
  return cities.includes(city);
}

export const SOCIETY_TYPES = [
  "Apartment Complex",
  "Gated Community",
  "Township",
  "Co-operative Housing",
  "Villa Society",
  "Other",
] as const;

export type SocietyType = (typeof SOCIETY_TYPES)[number];

export const PAYMENT_METHOD_OPTIONS = [
  { key: "Online" as const, icon: "💳", desc: "Residents pay online via UPI, card, or net banking" },
  { key: "Cash" as const, icon: "💵", desc: "Residents pay maintenance in cash" },
  { key: "Cheque" as const, icon: "📝", desc: "Residents pay via cheque" },
];

export type PaymentMethodKey = (typeof PAYMENT_METHOD_OPTIONS)[number]["key"];

export const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2 MB

export const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;

/** Validates a raster image data URL and its actual file signature. */
export function validateImageDataUrl(dataUrl: string): { ok: true } | { ok: false; error: string } {
  const match = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
  if (!match) {
    return { ok: false, error: "Society logo must be a JPG, PNG, WebP, or GIF image" };
  }

  const [, mimeType, b64] = match;
  if (!b64) return { ok: false, error: "Society logo is empty" };

  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  const bytes = Math.floor((b64.length * 3) / 4) - padding;
  if (bytes > MAX_LOGO_BYTES) {
    return { ok: false, error: "Society logo must be 2 MB or smaller" };
  }

  const signatures: Record<string, (value: string) => boolean> = {
    "image/png": (value) => value.startsWith("iVBORw0KGgo"),
    "image/jpeg": (value) => value.startsWith("/9j/"),
    "image/gif": (value) => value.startsWith("R0lGOD"),
    "image/webp": (value) => value.startsWith("UklGR") && atob(value.slice(0, 24)).includes("WEBP"),
  };

  if (!signatures[mimeType]?.(b64)) {
    return { ok: false, error: "Society logo is not a valid image file" };
  }

  return { ok: true };
}
