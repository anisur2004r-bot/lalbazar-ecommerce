export function formatBDT(amount: number | null | undefined): string {
  const value = amount ?? 0;
  return `৳${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function discountPercent(regular: number, sale?: number | null): number {
  if (!sale || sale >= regular) return 0;
  return Math.round(((regular - sale) / regular) * 100);
}

export function parseImages(images: string): string[] {
  try {
    const arr = JSON.parse(images);
    if (Array.isArray(arr)) return arr;
  } catch {}
  return [];
}

export function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `LB${y}${m}${d}${rnd}`;
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const DISTRICTS = [
  "Dhaka", "Chattogram", "Khulna", "Rajshahi", "Sylhet", "Barishal", "Rangpur", "Mymensingh",
  "Gazipur", "Narayanganj", "Comilla", "Bogura", "Dinajpur", "Tangail", "Jashore", "Cox's Bazar",
  "Natore", "Faridpur", "Pabna", "Kushtia",
];

export const DHAKA_AREAS = [
  "Gulshan", "Banani", "Dhanmondi", "Mohammadpur", "Mirpur", "Uttara", "Bashundhara", "Motijheel",
  "Paltan", "Farmgate", "Mohakhali", "Banashree", "Rampura", "Badda", "Khilgaon", "Sabujbagh",
  "Tejgaon", "Cantonment", "Lalbagh", "Kotwali", "Shyampur", "Demra", "Hazaribagh", "Adabor",
  "Sher-e-Bangla Nagar", "New Market", "Chandgaon", "Wari", "Ramna",
];

export function getAreasForDistrict(d: string): string[] {
  if (d === "Dhaka") return DHAKA_AREAS;
  return ["Sadar", "Town Center", "Main Road"];
}

export const PAYMENT_METHODS = [
  { id: "COD", label: "Cash on Delivery", labelBn: "ক্যাশ অন ডেলিভারি", desc: "Pay with cash when you receive your order", icon: "💵" },
  { id: "BKASH", label: "bKash", labelBn: "বিকাশ", desc: "Pay securely using bKash mobile wallet", icon: "📱" },
  { id: "NAGAD", label: "Nagad", labelBn: "নগদ", desc: "Pay with Nagad mobile wallet", icon: "📲" },
  { id: "SSLCOMMERZ", label: "Card / SSLCommerz", labelBn: "কার্ড / SSLCommerz", desc: "Visa, Mastercard, Amex via SSLCommerz", icon: "💳" },
];

export function formatDateTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function timeAgo(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return formatDate(iso);
}
